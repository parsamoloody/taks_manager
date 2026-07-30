import Link from "next/link";
import type { ReactNode } from "react";

interface AuthLayoutProps {
  eyebrow: string;
  action?: {
    href: string;
    label: string;
  };
  children: ReactNode;
}

export function AuthLayout({ eyebrow, action, children }: AuthLayoutProps) {
  return (
    <main
      id="main-content"
      className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.16),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.18),_transparent_34%),linear-gradient(135deg,_#f8fbff_0%,_#f3f7ff_100%)] p-4 sm:p-6 lg:p-8"
    >
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col overflow-hidden rounded-[32px] border border-slate-200/70 bg-white/80 shadow-[0_30px_80px_-24px_rgba(15,23,42,0.28)] backdrop-blur-xl lg:min-h-[680px] lg:flex-row">
        <section className="relative flex-1 overflow-hidden bg-slate-950 p-8 text-white sm:p-10 lg:p-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.22),_transparent_40%)]" />
          <div className="relative z-10 flex h-full flex-col justify-between">
            <div>
              <div className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm font-medium text-slate-100">
                Task Manager
              </div>
              <h1 className="mt-6 text-3xl font-semibold leading-tight sm:text-4xl">
                Organize your work with calm, clear momentum.
              </h1>
              <p className="mt-4 max-w-lg text-sm leading-7 text-slate-300 sm:text-base">
                Keep boards, lists, and tasks in one focused place so your team
                can move forward with confidence.
              </p>
            </div>
          </div>
        </section>

        <section className="flex flex-1 bg-slate-50/80 p-6 text-slate-950 sm:p-8 lg:p-10">
          <div className="mx-auto flex h-full w-full max-w-md flex-col justify-center">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-900">{eyebrow}</p>
              {action ? (
                <Link
                  href={action.href}
                  className="text-sm font-medium text-sky-600 transition hover:text-sky-700"
                >
                  {action.label}
                </Link>
              ) : null}
            </div>
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}
