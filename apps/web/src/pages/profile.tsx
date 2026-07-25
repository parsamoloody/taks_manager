import { useState } from "react";
import type { GetServerSideProps } from "next";
import Head from "next/head";
import type { UserDto } from "@repo/shared";
import { Avatar } from "~/components/ui/Avatar";
import { Button } from "~/components/ui/Button";
import { FormInput } from "~/components/ui/FormField";
import {
  MutationForm,
  MutationProvider,
  useMutation,
  type MutationResult,
} from "~/modules/mutations/client";
import { getCurrentUser } from "~/server/api/user";
import { loadProtectedPage } from "~/server/auth/page";

interface ProfilePageProps {
  user: UserDto;
}

export const getServerSideProps: GetServerSideProps<ProfilePageProps> = async (
  context,
) =>
  loadProtectedPage(context, async (token) => ({
    user: await getCurrentUser(token),
  }));

function ProfileForm({ user }: ProfilePageProps) {
  const mutation = useMutation<MutationResult>();
  const [isDirty, setIsDirty] = useState(false);
  const isSaving = mutation.state !== "idle";
  const displayName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;

  function handleFormChange(form: HTMLFormElement) {
    const data = new FormData(form);
    setIsDirty(
      String(data.get("firstName") ?? "") !== (user.firstName ?? "") ||
        String(data.get("lastName") ?? "") !== (user.lastName ?? "") ||
        String(data.get("email") ?? "") !== user.email ||
        String(data.get("avatar") ?? "") !== (user.avatar ?? "") ||
        String(data.get("password") ?? "").length > 0,
    );
  }

  return (
    <>
      <div className="mb-8 flex items-center gap-4 pb-6">
        <Avatar name={displayName} src={user.avatar} size="lg" fullRound />
        <div>
          <h1 className="text-2xl font-semibold sm:text-3xl">
            {user.firstName
              ? `Hi ${user.firstName}`
              : "Complete your information"}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Manage your personal information and password.
          </p>
        </div>
      </div>

      <MutationForm
        mutation={mutation}
        onChange={(event) => handleFormChange(event.currentTarget)}
        className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-2xl sm:p-8"
      >
        {mutation.data ? (
          <div
            className={`mb-6 rounded-md border px-4 py-3 text-sm ${
              mutation.data.ok
                ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
                : "border-rose-400/20 bg-rose-400/10 text-rose-200"
            }`}
          >
            {mutation.data.message}
          </div>
        ) : null}

        <div className="grid gap-5 sm:grid-cols-2">
          <FormInput
            name="firstName"
            label="First name"
            defaultValue={user.firstName ?? ""}
            maxLength={50}
          />
          <FormInput
            name="lastName"
            label="Last name"
            defaultValue={user.lastName ?? ""}
            maxLength={50}
          />
        </div>

        <FormInput
          wrapperClassName="mt-5"
          name="email"
          label="Email"
          type="email"
          required
          defaultValue={user.email}
          autoComplete="email"
        />

        <FormInput
          wrapperClassName="mt-5"
          name="avatar"
          label="Avatar URL"
          optional
          type="url"
          defaultValue={user.avatar ?? ""}
          placeholder="https://example.com/avatar.jpg"
        />

        <FormInput
          wrapperClassName="mt-5"
          name="password"
          label="New password"
          optional
          type="password"
          minLength={8}
          autoComplete="new-password"
          placeholder="Leave blank to keep your current password"
        />

        <div className="mt-8 flex justify-end">
          <Button
            type="submit"
            variant="primary"
            isLoading={isSaving}
            disabled={!isDirty}
          >
            Save changes
          </Button>
        </div>
      </MutationForm>
    </>
  );
}

export default function ProfilePage({ user }: ProfilePageProps) {
  return (
    <MutationProvider endpoint="/api/mutations/profile">
      <Head>
        <title>Profile · Tsk Manager</title>
      </Head>
      <main
        id="main-content"
        className="min-h-[calc(100vh-4rem)] bg-slate-950 px-4 py-10 text-white sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-3xl">
          <ProfileForm key={user.updatedAt} user={user} />
        </div>
      </main>
    </MutationProvider>
  );
}
