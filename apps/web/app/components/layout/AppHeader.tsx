import type { UserDto } from "@repo/shared";
import { Link, NavLink } from "react-router";
import { Avatar } from "~/components/ui/Avatar";

interface AppHeaderProps {
  user: UserDto | null;
}

export function AppHeader({ user }: AppHeaderProps) {
  const displayName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email
    : "Guest";

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/95 text-white backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-6">
          <Link to={user ? "/workspaces" : "/"} className="shrink-0 text-lg font-semibold tracking-tight">
            Tsk Manager
          </Link>
        </div>

        <Link
          to={user ? "/profile" : "/login"}
          aria-label={user ? `Open profile for ${displayName}` : "Sign in"}
          title={user ? displayName : "Sign in"}
          className="rounded-2xl outline-none ring-sky-400 transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          <Avatar name={displayName} src={user?.avatar} size="sm" fullRound />
        </Link>
      </div>
    </header>
  );
}
