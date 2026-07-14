// app/routes/login.tsx
import { redirect } from "react-router";
import type { Route } from "./+types/login";
import { signIn } from "~/lib/api/auth";
import { getErrorMessage } from "~/lib/api/client";
import { AuthPage, type AuthActionData } from "~/components/auth/AuthPage";
import { commitSession, getSession } from "~/lib/api/session.server";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Sign in · Tsk Manager" }];
}

// If already logged in, skip the form entirely
export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request);
  if (session.get("accessToken")) {
    throw redirect("/workspaces");
  }
  return null;
}

export async function action({ request }: Route.ActionArgs): Promise<AuthActionData | Response> {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { ok: false, message: "Please enter both your email and password." };
  }

  try {
    const result = await signIn({ email, password });
    const session = await getSession(request);
    session.set("accessToken", result.access_token);

    return redirect("/workspaces", {
      headers: { "Set-Cookie": await commitSession(session) },
    });
  } catch (error) {
    return { ok: false, message: getErrorMessage(error) };
  }
}

export default function LoginRoute() {
  return <AuthPage mode="login" />;
}