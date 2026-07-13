import { Link } from "react-router";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Tsk Manager" },
    {
      name: "description",
      content: "A modern task manager designed for calm, focused collaboration.",
    },
  ];
}

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-5xl flex-col items-center rounded-[32px] border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl sm:p-10 lg:flex-row lg:justify-between lg:p-12">
        <div className="max-w-xl">
          <p className="inline-flex rounded-full border border-sky-400/30 bg-sky-400/10 px-3 py-1 text-sm font-medium text-sky-200">
            Tsk Manager for your teams
          </p>
          <h1 className="mt-5 text-4xl font-semibold leading-tight sm:text-5xl">
            Turn daily work into a calm, shared rhythm.
          </h1>
          <p className="mt-4 text-lg leading-8 text-slate-300">
            Welcome to a clean task manager experience where boards, lists, and priorities feel effortless.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/signup"
              className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              Create account
            </Link>
            <Link
              to="/login"
              className="rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              Sign in
            </Link>
          </div>
        </div>

        <div className="mt-8 w-full max-w-sm rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-lg lg:mt-0">
          <p className="text-sm font-medium text-slate-200">Why teams love it</p>
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            {[
              "No limit",
              "Easy to use",
              "Clear daily priorities",
              "Flexible boards for every workflow",
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
