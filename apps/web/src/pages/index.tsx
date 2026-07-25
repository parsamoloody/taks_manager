import type { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import type { UserDto } from "@repo/shared";
import {
  HiArrowRight,
  HiCheckCircle,
  HiCollection,
  HiCursorClick,
  HiLightningBolt,
  HiOutlineChartBar,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineCollection,
  HiOutlineCursorClick,
  HiOutlineShieldCheck,
  HiOutlineSparkles,
  HiOutlineUserGroup,
  HiSparkles,
} from "react-icons/hi";
import { LandingBoardPreview } from "~/components/landing/LandingBoardPreview";
import { loadLandingPage, type LandingPageProps } from "~/server/auth/landing";

const FEATURES = [
  {
    icon: HiOutlineSparkles,
    label: "Think clearer",
    title: "AI-powered planning",
    description:
      "Turn rough ideas into useful next steps, sharpen task details, and find the work that matters most.",
    accent: "from-violet-400/20 via-violet-400/5 to-transparent",
    iconClass: "bg-violet-400/15 text-violet-200 ring-violet-300/20",
  },
  {
    icon: HiOutlineCursorClick,
    label: "Start instantly",
    title: "Simple by design",
    description:
      "Create a workspace, add a board, and move work forward without training, setup calls, or clutter.",
    accent: "from-sky-400/20 via-sky-400/5 to-transparent",
    iconClass: "bg-sky-400/15 text-sky-200 ring-sky-300/20",
  },
  {
    icon: HiOutlineShieldCheck,
    label: "Grow freely",
    title: "Free to get moving",
    description:
      "Bring your plans and your people together with the core tools you need to organize work at no cost.",
    accent: "from-emerald-400/20 via-emerald-400/5 to-transparent",
    iconClass: "bg-emerald-400/15 text-emerald-200 ring-emerald-300/20",
  },
] as const;

const WORKFLOW_STEPS = [
  {
    number: "01",
    icon: HiCollection,
    title: "Capture everything",
    description:
      "Collect projects, tasks, notes, and priorities in one calm workspace.",
  },
  {
    number: "02",
    icon: HiSparkles,
    title: "Let AI bring clarity",
    description:
      "Use smart suggestions to shape vague work into focused, useful next steps.",
  },
  {
    number: "03",
    icon: HiCheckCircle,
    title: "Move with confidence",
    description:
      "See what matters now, collaborate simply, and finish work without the noise.",
  },
] as const;

const CALM_FEATURES = [
  {
    icon: HiOutlineCollection,
    title: "Flexible boards",
    text: "Shape a workflow around the way your team already thinks.",
  },
  {
    icon: HiOutlineUserGroup,
    title: "Shared context",
    text: "Keep people, priorities, labels, and decisions beside the work.",
  },
  {
    icon: HiOutlineClock,
    title: "Dates that help",
    text: "Make starts and deadlines visible without building a complex system.",
  },
  {
    icon: HiOutlineChartBar,
    title: "Clear priorities",
    text: "Separate urgent work from everything that can comfortably wait.",
  },
] as const;

interface LandingActionsProps {
  user: UserDto | null;
  centered?: boolean;
}

function LandingActions({ user, centered = false }: LandingActionsProps) {
  const firstName = user?.firstName?.trim();

  return (
    <div
      className={`flex flex-col gap-3 sm:flex-row ${
        centered ? "justify-center" : ""
      }`}
    >
      {user ? (
        <>
          <Link
            href="/workspaces"
            className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_16px_40px_-16px_rgba(255,255,255,0.7)] transition duration-300 hover:-translate-y-0.5 hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
          >
            {firstName
              ? `Open ${firstName}’s workspace`
              : "Go to your workspace"}
            <HiArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/profile"
            className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/15 bg-white/[0.06] px-5 py-3 text-sm font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          >
            Account settings
          </Link>
        </>
      ) : (
        <>
          <Link
            href="/signup"
            className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_16px_40px_-16px_rgba(255,255,255,0.7)] transition duration-300 hover:-translate-y-0.5 hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
          >
            Start for free
            <HiArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/login"
            className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/15 bg-white/[0.06] px-5 py-3 text-sm font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          >
            Sign in
          </Link>
        </>
      )}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<LandingPageProps> =
  loadLandingPage;

export default function HomePage({ user }: LandingPageProps) {
  return (
    <>
      <Head>
        <title>Tsk Manager · Simple, free, AI-powered work</title>
        <meta
          name="description"
          content="Plan projects, focus priorities, and move work forward with a simple, free, AI-powered task manager."
        />
        <meta
          property="og:title"
          content="Tsk Manager · Calm work, powered by clarity"
        />
        <meta
          property="og:description"
          content="A simple, free, AI-powered home for your team's work."
        />
      </Head>

      <main
        id="main-content"
        className="overflow-hidden bg-slate-950 text-white"
      >
        <section className="relative isolate">
          <div className="landing-grid pointer-events-none absolute inset-0 -z-20 opacity-70" />
          <div className="pointer-events-none absolute left-1/2 top-[-20rem] -z-10 h-[42rem] w-[62rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,_rgba(56,189,248,0.18),_rgba(139,92,246,0.08)_42%,_transparent_70%)] blur-2xl" />
          <div className="pointer-events-none absolute -left-48 top-72 -z-10 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl" />

          <div className="mx-auto grid max-w-7xl gap-14 px-4 pb-24 pt-16 sm:px-6 sm:pt-24 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-12 lg:px-8 lg:pb-32 lg:pt-28">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-300/20 bg-sky-300/[0.08] px-3 py-1.5 text-xs font-semibold text-sky-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-300 opacity-50 motion-reduce:animate-none" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-300" />
                </span>
                Simple. Free. AI-powered.
              </div>

              <h1 className="mt-7 text-balance text-5xl font-semibold tracking-[-0.05em] text-white sm:text-6xl lg:text-[4.75rem] lg:leading-[0.98]">
                Make space for
                <span className="block bg-gradient-to-r from-sky-300 via-white to-violet-300 bg-clip-text text-transparent">
                  your best work.
                </span>
              </h1>

              <p className="mt-7 max-w-2xl text-pretty text-lg leading-8 text-slate-300 sm:text-xl sm:leading-9">
                Tsk turns scattered ideas into focused next steps with
                AI-powered planning, flexible boards, and a calm interface your
                whole team can understand in minutes.
              </p>

              <div className="mt-9">
                <LandingActions user={user} />
              </div>

              <div className="mt-7 flex flex-wrap gap-x-5 gap-y-3 text-xs font-medium text-slate-400 sm:text-sm">
                {[
                  "Free to get started",
                  "No credit card",
                  "Set up in minutes",
                ].map((item) => (
                  <span key={item} className="inline-flex items-center gap-1.5">
                    <HiOutlineCheckCircle className="h-4 w-4 text-emerald-300" />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative lg:pl-4">
              <div className="landing-float pointer-events-none absolute -right-2 -top-8 z-20 hidden rounded-2xl border border-white/10 bg-slate-900/90 px-4 py-3 shadow-2xl backdrop-blur-xl sm:block">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-400/15 text-violet-200">
                    <HiSparkles className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                      AI preview
                    </p>
                    <p className="text-xs font-medium text-slate-200">
                      3 next steps suggested
                    </p>
                  </div>
                </div>
              </div>
              <LandingBoardPreview />
            </div>
          </div>

          <div className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
            <div className="grid overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] sm:grid-cols-3">
              {[
                {
                  value: "$0",
                  label: "to start organizing",
                  icon: HiLightningBolt,
                },
                {
                  value: "1",
                  label: "clear home for every project",
                  icon: HiCollection,
                },
                {
                  value: "∞",
                  label: "ways to shape your workflow",
                  icon: HiCursorClick,
                },
              ].map(({ value, label, icon: Icon }, index) => (
                <div
                  key={label}
                  className={`flex items-center gap-4 px-6 py-5 ${
                    index > 0
                      ? "border-t border-white/10 sm:border-l sm:border-t-0"
                      : ""
                  }`}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06] text-sky-200 ring-1 ring-white/10">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-2xl font-semibold tracking-tight text-white">
                      {value}
                    </p>
                    <p className="text-xs leading-5 text-slate-400">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="features"
          className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8"
        >
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-300">
              Everything you need. Nothing you don’t.
            </p>
            <h2 className="mt-4 text-balance text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">
              Powerful enough for the work.
              <span className="block text-slate-500">
                Simple enough for everyone.
              </span>
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg sm:leading-8">
              Start with a clean board. Add intelligence, structure, and your
              team only when you need them.
            </p>
          </div>

          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <article
                  key={feature.title}
                  className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-slate-900/60 p-6 shadow-[0_24px_80px_-48px_rgba(56,189,248,0.4)] transition duration-500 hover:-translate-y-1 hover:border-white/20 sm:p-7"
                >
                  <div
                    className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${feature.accent} opacity-60 transition duration-500 group-hover:opacity-100`}
                  />
                  <div className="relative">
                    <span
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl ring-1 ${feature.iconClass}`}
                    >
                      <Icon className="h-6 w-6" />
                    </span>
                    <p className="mt-7 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      {feature.label}
                    </p>
                    <h3 className="mt-2 text-xl font-semibold text-white">
                      {feature.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-slate-400">
                      {feature.description}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="border-y border-white/10 bg-white/[0.025]">
          <div className="mx-auto grid max-w-7xl gap-12 px-4 py-24 sm:px-6 sm:py-28 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:px-8">
            <div>
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-400/15 text-violet-200 ring-1 ring-violet-300/20">
                <HiOutlineSparkles className="h-6 w-6" />
              </div>
              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.24em] text-violet-300">
                A calmer way to move
              </p>
              <h2 className="mt-4 text-balance text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
                From “we should” to
                <span className="block text-slate-500">
                  “it’s already moving.”
                </span>
              </h2>
              <p className="mt-5 max-w-xl text-base leading-8 text-slate-400">
                Tsk keeps the path from idea to finished work short, visible,
                and easy to follow.
              </p>
            </div>

            <ol className="space-y-3">
              {WORKFLOW_STEPS.map((step) => {
                const Icon = step.icon;
                return (
                  <li
                    key={step.number}
                    className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-2xl border border-white/10 bg-slate-950/70 p-4 transition duration-300 hover:border-sky-300/25 hover:bg-slate-900 sm:p-5"
                  >
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.05] text-sky-200 ring-1 ring-white/10">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-white sm:text-base">
                        {step.title}
                      </h3>
                      <p className="mt-1 text-xs leading-5 text-slate-400 sm:text-sm">
                        {step.description}
                      </p>
                    </div>
                    <span className="self-start text-xs font-semibold tracking-[0.18em] text-slate-600 transition group-hover:text-sky-300">
                      {step.number}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <article className="relative overflow-hidden rounded-[32px] border border-sky-300/15 bg-gradient-to-br from-sky-400/15 via-slate-900 to-violet-400/10 p-7 sm:p-10">
              <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-sky-300/10 blur-3xl" />
              <div className="relative max-w-xl">
                <span className="inline-flex items-center gap-2 rounded-full border border-sky-300/20 bg-sky-300/10 px-3 py-1 text-xs font-semibold text-sky-100">
                  <HiOutlineSparkles className="h-4 w-4" />
                  AI-assisted, human-directed
                </span>
                <h2 className="mt-6 text-balance text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
                  Get help shaping the work, without losing control of it.
                </h2>
                <p className="mt-4 text-sm leading-7 text-slate-300 sm:text-base">
                  Smart suggestions help you clarify tasks and priorities. You
                  decide what belongs on the board and what happens next.
                </p>
              </div>
              <div className="relative mt-10 rounded-2xl border border-white/10 bg-slate-950/70 p-4 backdrop-blur">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-400/15 text-violet-200">
                      <HiSparkles className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-xs font-medium text-white">
                        Make this task actionable
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        AI planning preview
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-200">
                    3 steps ready
                  </span>
                </div>
              </div>
            </article>

            <article className="rounded-[32px] border border-white/10 bg-slate-900/60 p-7 sm:p-9">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                Quietly capable
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-white">
                The details feel simple, too.
              </h2>
              <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                {CALM_FEATURES.map(({ icon: Icon, title, text }) => (
                  <div key={title}>
                    <Icon className="h-5 w-5 text-sky-300" />
                    <h3 className="mt-3 text-sm font-semibold text-white">
                      {title}
                    </h3>
                    <p className="mt-1.5 text-xs leading-5 text-slate-400">
                      {text}
                    </p>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </section>

        <section className="px-4 pb-24 sm:px-6 sm:pb-32 lg:px-8">
          <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[36px] border border-white/10 bg-white/[0.045] px-6 py-16 text-center shadow-[0_30px_100px_-50px_rgba(56,189,248,0.55)] sm:px-12 sm:py-20">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.14),_transparent_48%)]" />
            <div className="relative mx-auto max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-300">
                Less managing. More momentum.
              </p>
              <h2 className="mt-5 text-balance text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
                Your clearest workday can start right now.
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-400">
                Bring one project. Invite your team when you’re ready. Keep the
                setup simple and let the work speak for itself.
              </p>
              <div className="mt-8">
                <LandingActions user={user} centered />
              </div>
              {!user ? (
                <p className="mt-4 text-xs text-slate-500">
                  Free to start · No credit card required
                </p>
              ) : null}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
