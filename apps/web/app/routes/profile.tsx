import type { UpdateUserDto } from "@repo/shared";
import { Form, useActionData, useLoaderData, useNavigation } from "react-router";
import type { Route } from "./+types/profile";
import { requireAccessToken } from "~/lib/api/auth.server";
import { getErrorMessage } from "~/lib/api/client";
import { getCurrentUser, updateCurrentUser } from "~/lib/api/user";
import { Avatar } from "~/components/ui/Avatar";
import { FormInput } from "~/components/ui/FormField";
import { Button } from "~/components/ui/Button";
import { useEffect, useState } from "react";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Profile · Tsk Manager" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const token = await requireAccessToken(request);
  return { user: await getCurrentUser(token) };
}

export async function action({ request }: Route.ActionArgs) {
  const token = await requireAccessToken(request);
  const formData = await request.formData();
  const password = String(formData.get("password") ?? "");

  const payload: UpdateUserDto = {
    firstName: String(formData.get("firstName") ?? "").trim(),
    lastName: String(formData.get("lastName") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    avatar: String(formData.get("avatar") ?? "").trim() || undefined,
    ...(password ? { password } : {}),
  };

  try {
    await updateCurrentUser(token, payload);
    return { ok: true, message: "Profile updated successfully." };
  } catch (error) {
    return { ok: false, message: getErrorMessage(error) };
  }
}

export default function ProfilePage() {
  const { user } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [isDirty, setIsDirty] = useState(false);
  const isSaving = navigation.state !== "idle";
  const displayName = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;

  useEffect(() => {
    setIsDirty(false);
  }, [user.updatedAt]);

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
    <main className="min-h-[calc(100vh-4rem)] bg-slate-950 px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center gap-4 pb-6">
          <Avatar name={displayName} src={user.avatar} size="lg" fullRound />
          <div>
            <h1 className="text-2xl font-semibold sm:text-3xl">{
              user.firstName ? (`Hi ${user.firstName}`) : ("Complete your information")
              }</h1>
            <p className="mt-1 text-sm text-slate-400">Manage your personal information and password.</p>
          </div>
        </div>

        <Form
          key={user.updatedAt}
          method="post"
          onChange={(event) => handleFormChange(event.currentTarget)}
          className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-2xl sm:p-8"
        >
          {actionData ? (
            <div className={`mb-6 rounded-2xl border px-4 py-3 text-sm ${actionData.ok ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200" : "border-rose-400/20 bg-rose-400/10 text-rose-200"}`}>
              {actionData.message}
            </div>
          ) : null}

          <div className="grid gap-5 sm:grid-cols-2">
            <FormInput name="firstName" label="First name" defaultValue={user.firstName ?? ""} maxLength={50} />
            <FormInput name="lastName" label="Last name" defaultValue={user.lastName ?? ""} maxLength={50} />
          </div>

          <FormInput wrapperClassName="mt-5" name="email" label="Email" type="email" required defaultValue={user.email} autoComplete="email" />

          <FormInput wrapperClassName="mt-5" name="avatar" label="Avatar URL" optional type="url" defaultValue={user.avatar ?? ""} placeholder="https://example.com/avatar.jpg" />

          <FormInput wrapperClassName="mt-5" name="password" label="New password" optional type="password" minLength={8} autoComplete="new-password" placeholder="Leave blank to keep your current password" />

          <div className="mt-8 flex justify-end">
            <Button type="submit" variant="primary" isLoading={isSaving} disabled={!isDirty}>
              Save changes
            </Button>
          </div>
        </Form>
      </div>
    </main>
  );
}
