import Link from "next/link";
import { useRouter } from "next/router";
import { AuthField } from "./AuthField";
import { AuthLayout } from "./AuthLayout";
import {
  MutationForm,
  MutationProvider,
  useMutation,
} from "~/modules/mutations/client";

type AuthMode = "login" | "signup";

export interface AuthActionData {
  ok: boolean;
  message?: string;
}

interface AuthPageProps {
  mode: AuthMode;
}

export function AuthPage({ mode }: AuthPageProps) {
  return (
    <MutationProvider
      endpoint={mode === "login" ? "/api/auth/login" : "/api/auth/signup"}
      redirectTo="/workspaces"
    >
      <AuthPageContent mode={mode} />
    </MutationProvider>
  );
}

function AuthPageContent({ mode }: AuthPageProps) {
  const isLogin = mode === "login";
  const router = useRouter();
  const mutation = useMutation<AuthActionData>();
  const isSubmitting = mutation.state !== "idle";
  const passwordWasReset = isLogin && router.query.passwordReset === "success";

  return (
    <AuthLayout
      eyebrow={isLogin ? "Welcome back" : "Create your account"}
      action={{
        href: isLogin ? "/signup" : "/login",
        label: isLogin ? "Create account" : "Sign in",
      }}
    >
      <MutationForm mutation={mutation} className="mt-8 space-y-5">
        {passwordWasReset ? (
          <div
            role="status"
            className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
          >
            Your password has been updated. Sign in with your new password.
          </div>
        ) : null}

        {mutation.data && !mutation.data.ok ? (
          <div
            role="alert"
            className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
          >
            {mutation.data.message}
          </div>
        ) : null}

        <AuthField
          label="Email"
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
        />

        <div>
          <div className="mb-1.5 flex items-center justify-between gap-3">
            <label
              htmlFor="password"
              className="text-xs font-semibold text-slate-700"
            >
              Password
            </label>
            {isLogin ? (
              <Link
                href="/forgot-password"
                className="text-xs font-semibold text-sky-600 transition hover:text-sky-700"
              >
                Forgot password?
              </Link>
            ) : null}
          </div>
          <AuthField
            label={undefined}
            name="password"
            type="password"
            placeholder="Enter your password"
            autoComplete={isLogin ? "current-password" : "new-password"}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting
            ? isLogin
              ? "Signing in..."
              : "Creating account..."
            : isLogin
              ? "Sign in"
              : "Create account"}
        </button>
      </MutationForm>
    </AuthLayout>
  );
}
