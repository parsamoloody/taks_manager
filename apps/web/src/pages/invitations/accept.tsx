import type { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import type { UserDto } from "@repo/shared";
import { HiOutlineMailOpen } from "react-icons/hi";

import { Notification } from "~/components/ui/Notification";
import {
  MutationForm,
  MutationProvider,
  useMutation,
} from "~/modules/mutations/client";
import { isUnauthorizedError } from "~/server/api/client";
import { getCurrentUser } from "~/server/api/user";
import { clearAccessToken, getAccessToken } from "~/server/auth/session";
import { setPrivateNoStore } from "~/server/http/handlers";

interface InvitationPageProps {
  user: UserDto | null;
  token: string | null;
}

interface ActionData {
  ok: boolean;
  message?: string;
}

export const getServerSideProps: GetServerSideProps<
  InvitationPageProps
> = async (context) => {
  setPrivateNoStore(context.res);
  const inviteToken = context.query.token;
  const token =
    typeof inviteToken === "string" && inviteToken.trim() ? inviteToken : null;
  const accessToken = getAccessToken(context.req);
  let user: UserDto | null = null;

  if (accessToken) {
    try {
      user = await getCurrentUser(accessToken);
    } catch (error) {
      if (isUnauthorizedError(error)) clearAccessToken(context.res);
    }
  }

  return { props: { user, token } };
};

export default function AcceptInvitationPage({
  user,
  token,
}: InvitationPageProps) {
  return (
    <>
      <Head>
        <title>Accept invitation · Task Manager</title>
      </Head>
      <MutationProvider endpoint="/api/invitations/accept">
        <main
          id="main-content"
          className="product-grid min-h-[calc(100dvh-4rem)] bg-slate-950 px-4 py-12 text-white sm:px-6"
        >
          <div className="mx-auto max-w-lg">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-sky-300/20 bg-sky-400/10 text-sky-200">
              <HiOutlineMailOpen className="h-6 w-6" />
            </div>
            <h1 className="mt-6 text-3xl font-semibold text-white">
              Join your team
            </h1>
            {!token ? (
              <InvalidInvitation />
            ) : user ? (
              <InvitationForm token={token} email={user.email} />
            ) : (
              <SignInPrompt token={token} />
            )}
          </div>
        </main>
      </MutationProvider>
    </>
  );
}

function InvitationForm({ token, email }: { token: string; email: string }) {
  const mutation = useMutation<ActionData>();
  const isSubmitting = mutation.state !== "idle";

  return (
    <>
      <p className="mt-3 text-sm leading-6 text-slate-400">
        You’re signed in as <strong className="text-slate-200">{email}</strong>.
        Accept to add this workspace or board to your account.
      </p>
      <MutationForm mutation={mutation} className="mt-7">
        <input type="hidden" name="token" value={token} />
        {mutation.data && !mutation.data.ok ? (
          <Notification tone="error" className="mb-4">
            {mutation.data.message}
          </Notification>
        ) : null}
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex min-h-11 w-full items-center justify-center rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Accepting invitation..." : "Accept invitation"}
        </button>
      </MutationForm>
    </>
  );
}

function SignInPrompt({ token }: { token: string }) {
  const returnTo = `/invitations/accept?token=${encodeURIComponent(token)}`;
  const loginHref = `/login?returnTo=${encodeURIComponent(returnTo)}`;
  const signupHref = `/signup?returnTo=${encodeURIComponent(returnTo)}`;

  return (
    <>
      <p className="mt-3 text-sm leading-6 text-slate-400">
        Sign in with the email address that received this invitation, or create
        an account with that address.
      </p>
      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
        <Link
          href={loginHref}
          className="flex min-h-11 flex-1 items-center justify-center rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-sky-50"
        >
          Sign in
        </Link>
        <Link
          href={signupHref}
          className="flex min-h-11 flex-1 items-center justify-center rounded-lg border border-white/15 bg-white/[0.06] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/[0.1]"
        >
          Create account
        </Link>
      </div>
    </>
  );
}

function InvalidInvitation() {
  return (
    <>
      <p className="mt-3 text-sm leading-6 text-slate-400">
        This invitation link is missing its token. Ask the workspace owner to
        send a new invitation.
      </p>
      <Link
        href="/workspaces"
        className="mt-7 inline-flex min-h-11 items-center justify-center rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-sky-50"
      >
        Go to workspaces
      </Link>
    </>
  );
}
