import type { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { HiOutlineKey, HiOutlineLink } from "react-icons/hi";

import { AuthField } from "~/components/auth/AuthField";
import { AuthLayout } from "~/components/auth/AuthLayout";
import {
  MutationForm,
  MutationProvider,
  useMutation,
} from "~/modules/mutations/client";
import { loadGuestPage } from "~/server/auth/guest";

interface ResetPasswordPageProps {
  token: string | null;
}

interface ActionData {
  ok: boolean;
  message?: string;
}

export const getServerSideProps: GetServerSideProps<
  ResetPasswordPageProps
> = async (context) => {
  const guestResult = await loadGuestPage(context);
  if ("redirect" in guestResult) return guestResult;

  const token = context.query.token;
  return {
    props: {
      token: typeof token === "string" && token.trim() ? token : null,
    },
  };
};

export default function ResetPasswordPage({ token }: ResetPasswordPageProps) {
  return (
    <>
      <Head>
        <title>Choose a new password · Task Manager</title>
      </Head>
      <MutationProvider endpoint="/api/auth/reset-password">
        <AuthLayout
          eyebrow="Account recovery"
          action={{ href: "/login", label: "Back to sign in" }}
        >
          {token ? <ResetPasswordForm token={token} /> : <InvalidResetLink />}
        </AuthLayout>
      </MutationProvider>
    </>
  );
}

function ResetPasswordForm({ token }: { token: string }) {
  const mutation = useMutation<ActionData>();
  const isSubmitting = mutation.state !== "idle";

  return (
    <>
      <div className="mt-6 flex h-11 w-11 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
        <HiOutlineKey className="h-6 w-6" />
      </div>
      <h1 className="mt-5 text-2xl font-semibold text-slate-950">
        Choose a new password
      </h1>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Use at least 8 characters and choose a password you haven’t used
        elsewhere.
      </p>

      <MutationForm mutation={mutation} className="mt-7 space-y-5">
        <input type="hidden" name="token" value={token} />
        {mutation.data && !mutation.data.ok ? (
          <p
            role="alert"
            className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
          >
            {mutation.data.message}
          </p>
        ) : null}
        <AuthField
          label="New password"
          name="password"
          type="password"
          placeholder="Enter a new password"
          autoComplete="new-password"
        />
        <AuthField
          label="Confirm new password"
          name="confirmPassword"
          type="password"
          placeholder="Enter it again"
          autoComplete="new-password"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Updating password..." : "Update password"}
        </button>
      </MutationForm>
    </>
  );
}

function InvalidResetLink() {
  return (
    <div className="mt-8">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
        <HiOutlineLink className="h-6 w-6" />
      </div>
      <h1 className="mt-5 text-2xl font-semibold text-slate-950">
        This link isn’t valid
      </h1>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        The reset token is missing. Request a new email to continue securely.
      </p>
      <Link
        href="/forgot-password"
        className="mt-7 flex min-h-11 items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
      >
        Request a new link
      </Link>
    </div>
  );
}
