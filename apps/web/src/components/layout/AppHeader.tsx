import type { UserDto } from "@repo/shared";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { Avatar } from "~/components/ui/Avatar";
import { KebabMenu } from "~/components/ui/KebabMenu";
import {
  HiOutlineCheck,
  HiOutlineLogout,
  HiOutlineUser,
  HiOutlineViewGrid,
} from "react-icons/hi";

interface AppHeaderProps {
  user: UserDto | null;
}

export function AppHeader({ user }: AppHeaderProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const displayName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email
    : "Guest";

  async function logOut() {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
        headers: { Accept: "application/json" },
      });
    } finally {
      await router.replace("/login");
      setIsLoggingOut(false);
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-slate-950/90 text-white backdrop-blur-xl">
      <a
        href="#main-content"
        className="fixed left-3 top-3 z-[60] -translate-y-20 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-950 shadow-xl transition focus:translate-y-0"
      >
        Skip to content
      </a>
      <div className="mx-auto flex h-16 max-w-[100rem] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-6">
          <Link
            href={user ? "/workspaces" : "/"}
            className="group flex shrink-0 items-center gap-2.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-300 to-violet-400 text-slate-950 shadow-[0_8px_22px_-10px_rgba(56,189,248,0.8)]">
              <HiOutlineCheck className="h-5 w-5 stroke-[2.5]" />
            </span>
            <span className="text-base font-semibold tracking-tight sm:text-lg">
              Tsk Manager
            </span>
          </Link>

          {user ? (
            <nav aria-label="Primary navigation" className="hidden sm:block">
              <Link
                href="/workspaces"
                aria-current={
                  router.pathname.startsWith("/workspaces") ? "page" : undefined
                }
                className={`inline-flex min-h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-sky-300 ${
                  router.pathname.startsWith("/workspaces")
                    ? "bg-white/[0.07] text-white"
                    : "text-slate-400 hover:bg-white/[0.05] hover:text-white"
                }`}
              >
                <HiOutlineViewGrid className="h-4 w-4" />
                Workspaces
              </Link>
            </nav>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <div id="header-board-actions" className="flex items-center" />
          {user ? (
            <KebabMenu
              label={`Open account menu for ${displayName}`}
              trigger={
                <Avatar
                  name={displayName}
                  src={user.avatar}
                  size="sm"
                  fullRound
                />
              }
              items={[
                {
                  label: "Edit profile",
                  icon: <HiOutlineUser className="h-4 w-4" />,
                  onClick: () => void router.push("/profile"),
                },
                {
                  label: isLoggingOut ? "Logging out…" : "Log out",
                  icon: <HiOutlineLogout className="h-4 w-4" />,
                  variant: "danger",
                  onClick: () => void logOut(),
                },
              ]}
            />
          ) : (
            <Link
              href="/login"
              className="inline-flex min-h-10 items-center gap-2 rounded-xl px-1.5 text-sm font-semibold text-slate-300 outline-none transition hover:bg-white/[0.06] hover:text-white focus-visible:ring-2 focus-visible:ring-sky-300 sm:px-3"
            >
              <Avatar name="Guest" size="sm" fullRound />
              <span className="hidden sm:inline">Sign in</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
