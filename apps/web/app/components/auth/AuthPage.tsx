// app/components/auth/AuthPage.tsx
import { Form, Link, useNavigation, useActionData } from "react-router";
import { AuthField } from "./AuthField";

type AuthMode = "login" | "signup";

export interface AuthActionData {
  ok: boolean;
  message?: string;
}

interface AuthPageProps {
  mode: AuthMode;
}

export function AuthPage({ mode }: AuthPageProps) {
  const isLogin = mode === "login";
  const navigation = useNavigation();
  const actionData = useActionData<AuthActionData>();

  const isSubmitting =
    navigation.state === "submitting" || navigation.state === "loading";

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.16),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.18),_transparent_34%),linear-gradient(135deg,_#f8fbff_0%,_#f3f7ff_100%)] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto flex max-w-6xl flex-col overflow-hidden rounded-[32px] border border-slate-200/70 bg-white/80 shadow-[0_30px_80px_-24px_rgba(15,23,42,0.28)] backdrop-blur-xl lg:flex-row">
        <section className="relative flex-1 bg-slate-950 p-8 text-white sm:p-10 lg:p-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.22),_transparent_40%)]" />
          <div className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm font-medium text-slate-100">
            Task Manager
          </div>
          <div className="relative z-10 flex h-full flex-col justify-between">
            <div>
              <h1 className="mt-6 text-3xl font-semibold leading-tight sm:text-4xl">
                Organize your work with calm, clear momentum.
              </h1>
              <p className="mt-4 max-w-lg text-sm leading-7 text-slate-300 sm:text-base">
                Keep boards, lists, and tasks in one beautifully simple place so your
                team can move faster without feeling rushed.
              </p>
            </div>
          </div>
        </section>

        <section className="flex-1 bg-slate-50/80 p-6 sm:p-8 lg:p-10">
          <div className="mx-auto flex h-full max-w-md flex-col justify-center">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {isLogin ? "Welcome back" : "Create your account"}
                </p>
              </div>
              <Link
                to={isLogin ? "/signup" : "/login"}
                className="text-sm font-medium text-sky-600 transition hover:text-sky-700"
              >
                {isLogin ? "Create account" : "Sign in"}
              </Link>
            </div>

            <Form method="post" className="mt-8 space-y-5">
              {actionData && !actionData.ok ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {actionData.message}
                </div>
              ) : null}

              <AuthField
                label="Email"
                name="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
              />

              <AuthField
                label="Password"
                name="password"
                type="password"
                placeholder="Enter your password"
                autoComplete={isLogin ? "current-password" : "new-password"}
              />

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting
                  ? isLogin
                    ? "Signing in..."
                    : "Creating account..."
                  : isLogin
                    ? "Sign in"
                    : "Create account"}
              </button>
            </Form>
          </div>
        </section>
      </div>
    </main>
  );
}