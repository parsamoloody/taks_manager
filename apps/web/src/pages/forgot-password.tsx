import type { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { HiOutlineCheckCircle, HiOutlineMail } from "react-icons/hi";

import { AuthField } from "~/components/auth/AuthField";
import { AuthLayout } from "~/components/auth/AuthLayout";
import {
  MutationForm,
  MutationProvider,
  useMutation,
} from "~/modules/mutations/client";
import { loadGuestPage } from "~/server/auth/guest";

interface ForgotPasswordPageProps {
  sent: boolean;
}

interface ActionData {
  ok: boolean;
  message?: string;
}

export const getServerSideProps: GetServerSideProps<
  ForgotPasswordPageProps
> = async (context) => {
  const guestResult = await loadGuestPage(context);
  if ("redirect" in guestResult) return guestResult;

  return {
    props: {
      sent: context.query.sent === "success",
    },
  };
};

export default function ForgotPasswordPage({ sent }: ForgotPasswordPageProps) {
  return (
    <>
      <Head>
        <title>Reset your password · Task Manager</title>
      </Head>
      <MutationProvider endpoint="/api/auth/forgot-password">
        <AuthLayout
          eyebrow={sent ? "Check your inbox" : "Reset your password"}
          action={{ href: "/login", label: "Back to sign in" }}
        >
          {sent ? <RequestSent /> : <ForgotPasswordForm />}
        </AuthLayout>
      </MutationProvider>
    </>
  );
}

function ForgotPasswordForm() {
  const mutation = useMutation<ActionData>();
  const isSubmitting = mutation.state !== "idle";

  return (
    <>
      <div className="mt-6 flex h-11 w-11 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
        <HiOutlineMail className="h-6 w-6" />
      </div>
      <h1 className="mt-5 text-2xl font-semibold text-slate-950">
        Find your account
      </h1>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Enter your account email and we’ll send a secure reset link if it
        matches an account.
      </p>

      <MutationForm mutation={mutation} className="mt-7 space-y-5">
        {mutation.data && !mutation.data.ok ? (
          <p
            role="alert"
            className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
          >
            {mutation.data.message}
          </p>
        ) : null}
        <AuthField
          label="Email"
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Sending reset link..." : "Send reset link"}
        </button>
      </MutationForm>
    </>
  );
}

function RequestSent() {
  return (
    <div className="mt-8">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
        <HiOutlineCheckCircle className="h-6 w-6" />
      </div>
      <h1 className="mt-5 text-2xl font-semibold text-slate-950">
        Reset link requested
      </h1>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        If that email belongs to an account, a reset link is on its way. Check
        your spam folder if it doesn’t arrive shortly.
      </p>
      <div className="mt-7 flex flex-col gap-3">
        <Link
          href="/login"
          className="flex min-h-11 items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Return to sign in
        </Link>
        <Link
          href="/forgot-password"
          className="text-center text-sm font-semibold text-sky-700 transition hover:text-sky-800"
        >
          Try another email
        </Link>
      </div>
    </div>
  );
}
