import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type FormHTMLAttributes,
  type ForwardedRef,
  type ReactElement,
  type ReactNode,
} from "react";
import { useRouter } from "next/router";

export type MutationState = "idle" | "submitting" | "loading";

export interface MutationResult {
  ok: boolean;
  intent?: string;
  message?: string;
  redirectTo?: string;
}

interface MutationProviderProps {
  children: ReactNode;
  endpoint: string;
  redirectTo?: string;
}

interface MutationContextValue {
  endpoint: string;
  redirectTo?: string;
}

const MutationContext = createContext<MutationContextValue | null>(null);

export function MutationProvider({
  children,
  endpoint,
  redirectTo,
}: MutationProviderProps) {
  const value = useMemo(
    () => ({ endpoint, redirectTo }),
    [redirectTo],
  );

  return (
    <MutationContext.Provider value={value}>
      {children}
    </MutationContext.Provider>
  );
}

type MutationRecordValue =
  | FormDataEntryValue
  | readonly FormDataEntryValue[]
  | number
  | boolean
  | null
  | undefined;

export type MutationSubmission =
  HTMLFormElement | FormData | Record<string, MutationRecordValue> | null;

export interface MutationSubmitOptions {
  redirectTo?: string;
}

export interface MutationController<T> {
  data: T | undefined;
  endpoint: string;
  formData: FormData | undefined;
  state: MutationState;
  submit: (
    submission: MutationSubmission,
    options?: MutationSubmitOptions,
  ) => Promise<T | undefined>;
}

function submissionToFormData(submission: MutationSubmission) {
  if (submission instanceof FormData) return submission;
  if (submission instanceof HTMLFormElement) return new FormData(submission);

  const formData = new FormData();
  if (!submission) return formData;

  for (const [name, rawValue] of Object.entries(submission)) {
    const values = Array.isArray(rawValue) ? rawValue : [rawValue];

    for (const value of values) {
      if (value === null || value === undefined) continue;
      formData.append(name, String(value));
    }
  }

  return formData;
}

function formDataToJson(formData: FormData) {
  const payload: Record<string, string | string[]> = {};

  for (const [name, rawValue] of formData.entries()) {
    const value = typeof rawValue === "string" ? rawValue : rawValue.name;
    const current = payload[name];

    if (current === undefined) {
      payload[name] = value;
    } else if (Array.isArray(current)) {
      current.push(value);
    } else {
      payload[name] = [current, value];
    }
  }

  return payload;
}

async function readResponse<T>(response: Response): Promise<T | undefined> {
  const text = await response.text();
  if (!text) return undefined;

  try {
    return JSON.parse(text) as T;
  } catch {
    return {
      ok: false,
      message: text,
    } as unknown as T;
  }
}

export function useMutation<T = MutationResult>(): MutationController<T> {
  const context = useContext(MutationContext);
  const router = useRouter();
  const requestId = useRef(0);
  const [state, setState] = useState<MutationState>("idle");
  const [data, setData] = useState<T>();
  const [formData, setFormData] = useState<FormData>();

  if (!context) {
    throw new Error("useMutation must be used inside a MutationProvider");
  }

  const { endpoint, redirectTo: providerRedirectTo } = context;

  const submit = useCallback(
    async (submission: MutationSubmission, options?: MutationSubmitOptions) => {
      const currentRequestId = ++requestId.current;
      const nextFormData = submissionToFormData(submission);
      setFormData(nextFormData);
      setData(undefined);
      setState("submitting");

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          credentials: "same-origin",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formDataToJson(nextFormData)),
        });
        const result = await readResponse<T>(response);

        if (currentRequestId !== requestId.current) return result;

        setData(result);

        if (response.status === 401) {
          setState("loading");
          await router.replace("/login");
          setState("idle");
          return result;
        }

        const mutationResult = result as unknown as MutationResult | undefined;
        if (!response.ok || mutationResult?.ok === false) {
          setState("idle");
          return result;
        }

        setState("loading");
        const redirectTo =
          options?.redirectTo ??
          mutationResult?.redirectTo ??
          providerRedirectTo;

        if (redirectTo) {
          await router.replace(redirectTo);
        } else {
          await router.replace(router.asPath, undefined, { scroll: false });
        }

        if (currentRequestId === requestId.current) setState("idle");
        return result;
      } catch (error) {
        if (currentRequestId !== requestId.current) return undefined;

        const result = {
          ok: false,
          message:
            error instanceof Error
              ? error.message
              : "Something went wrong. Please try again.",
        } as unknown as T;
        setData(result);
        setState("idle");
        return result;
      }
    },
    [endpoint, providerRedirectTo, router],
  );

  return {
    data,
    endpoint,
    formData,
    state,
    submit,
  };
}

interface MutationFormProps<T> extends Omit<
  FormHTMLAttributes<HTMLFormElement>,
  "action" | "method" | "onSubmit"
> {
  mutation: MutationController<T>;
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  redirectTo?: string;
}

function MutationFormComponent<T>(
  { mutation, onSubmit, redirectTo, children, ...props }: MutationFormProps<T>,
  ref: ForwardedRef<HTMLFormElement>,
) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    onSubmit?.(event);
    if (event.defaultPrevented) return;

    event.preventDefault();
    void mutation.submit(event.currentTarget, { redirectTo });
  }

  return (
    <form
      {...props}
      ref={ref}
      action={mutation.endpoint}
      method="post"
      onSubmit={handleSubmit}
    >
      {children}
    </form>
  );
}

export const MutationForm = forwardRef(MutationFormComponent) as <T>(
  props: MutationFormProps<T> & {
    ref?: ForwardedRef<HTMLFormElement>;
  },
) => ReactElement;
