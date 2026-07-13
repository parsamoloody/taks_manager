import { useState, type FormEvent } from "react";
import { Link } from "react-router";
import { getErrorMessage, signIn, signUp } from "../../lib/api/auth";
import { AuthField } from "./AuthField";

type AuthMode = "login" | "signup";

interface AuthPageProps {
  mode: AuthMode;
}

export function AuthPage({ mode }: AuthPageProps) {
  const isLogin = mode === "login";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setFeedback({
        type: "error",
        text: "Please enter both your email and password.",
      });
      return;
    }

    setIsLoading(true);
    setFeedback(null);

    try {
      const response = isLogin
        ? await signIn({ email, password })
        : await signUp({ email, password });

      if (response.access_token) {
        setFeedback({
          type: "success",
          text: isLogin
            ? "Welcome back. You are signed in."
            : "Account created successfully. You can sign in now.",
        });
      } else {
        setFeedback({
          type: "success",
          text: isLogin
            ? "Welcome back. You are signed in."
            : "Account created successfully. You can sign in now.",
        });
      }

      setEmail("");
      setPassword("");
    } catch (error) {
      setFeedback({
        type: "error",
        text: getErrorMessage(error),
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.16),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.18),_transparent_34%),linear-gradient(135deg,_#f8fbff_0%,_#f3f7ff_100%)] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto flex max-w-6xl flex-col overflow-hidden rounded-[32px] border border-slate-200/70 bg-white/80 shadow-[0_30px_80px_-24px_rgba(15,23,42,0.28)] backdrop-blur-xl lg:flex-row">
        <section className="relative flex-1 bg-slate-950 p-8 text-white sm:p-10 lg:p-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.22),_transparent_40%)]" />
              <div className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm font-medium text-slate-100">
                Task Manager
              </div>
          <div className="relative z-10 justify-center flex h-full flex-col justify-between">
            <div>
              <h1 className="mt-6 text-3xl font-semibold leading-tight sm:text-4xl">
                Organize your work with calm, clear momentum.
              </h1>
              <p className="mt-4 max-w-lg text-sm leading-7 text-slate-300 sm:text-base">
                Keep boards, lists, and tasks in one beautifully simple place so your team can move faster without feeling rushed.
              </p>
            </div>
{/* 
            <div className="mt-8 space-y-3 text-sm text-slate-200">
              {[
                "Shared boards for every project",
                "Focused task lists with smart priorities",
                "A clean experience built for real work",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-400/20 text-sky-300">
                    ✓
                  </span>
                  <span>{item}</span>
                </div>
              ))}
            </div> */}
          </div>
        </section>

        <section className="flex-1 bg-slate-50/80 p-6 sm:p-8 lg:p-10">
          <div className="mx-auto flex h-full max-w-md flex-col justify-center">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {isLogin ? "Welcome back" : "Create your account"}
                </p>
                {/* <p className="text-sm text-slate-500">
                  {isLogin
                    ? "Sign in to continue where you left off."
                    : "Start organizing your work in minutes."}
                </p> */}
              </div>
              <Link
                to={isLogin ? "/signup" : "/login"}
                className="text-sm font-medium text-sky-600 transition hover:text-sky-700"
              >
                {isLogin ? "Create account" : "Sign in"}
              </Link>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              {feedback ? (
                <div
                  className={`rounded-2xl border px-4 py-3 text-sm ${
                    feedback.type === "success"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-rose-200 bg-rose-50 text-rose-700"
                  }`}
                >
                  {feedback.text}
                </div>
              ) : null}

              <AuthField
                label="Email"
                type="email"
                value={email}
                placeholder="you@example.com"
                autoComplete="email"
                onChange={setEmail}
              />

              <AuthField
                label="Password"
                type="password"
                value={password}
                placeholder="Enter your password"
                autoComplete={isLogin ? "current-password" : "new-password"}
                onChange={setPassword}
              />

              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoading
                  ? isLogin
                    ? "Signing in..."
                    : "Creating account..."
                  : isLogin
                    ? "Sign in"
                    : "Create account"}
              </button>
            </form>

            {/* <div className="mt-6 rounded-2xl border border-slate-200 bg-white/80 p-4 text-sm text-slate-600">
              By continuing, you agree to our terms and privacy policy.
            </div> */}
          </div>
        </section>
      </div>
    </main>
  );
}
