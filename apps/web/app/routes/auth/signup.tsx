// app/routes/signup.tsx
import { redirect } from "react-router";
import type { Route } from "./+types/signup";
import { signUp } from "~/lib/api/auth";
import { getErrorMessage } from "~/lib/api/client";
import { commitSession, getSession } from "~/lib/api/session.server";
import { AuthPage, type AuthActionData } from "~/components/auth/AuthPage";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Create account · Tsk Manager" }];
}

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
    const result = await signUp({ email, password });
    const session = await getSession(request);
    session.set("accessToken", result.access_token);

    // Auto sign-in after signup — remove this block and `redirect` to
    // `/login` instead if you'd rather force a separate sign-in step.
    return redirect("/workspaces", {
      headers: { "Set-Cookie": await commitSession(session) },
    });
  } catch (error) {
    return { ok: false, message: getErrorMessage(error) };
  }
}

export default function SignupRoute() {
  return <AuthPage mode="signup" />;
}