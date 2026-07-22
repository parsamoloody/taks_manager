import type { UserDto } from "@repo/shared";
import { Link, useNavigate, useSubmit } from "react-router";
import { Avatar } from "~/components/ui/Avatar";
import { KebabMenu } from "~/components/ui/KebabMenu";
import { HiOutlineLogout, HiOutlineUser } from "react-icons/hi";

interface AppHeaderProps {
  user: UserDto | null;
}

export function AppHeader({ user }: AppHeaderProps) {
  const navigate = useNavigate();
  const submit = useSubmit();
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

        <div className="flex items-center gap-2">
          <div id="header-board-actions" className="flex items-center" />
        {user ? (
          <KebabMenu
            label={`Open account menu for ${displayName}`}
            trigger={<Avatar name={displayName} src={user.avatar} size="sm" fullRound />}
            items={[
              {
                label: "Edit profile",
                icon: <HiOutlineUser className="h-4 w-4" />,
                onClick: () => navigate("/profile"),
              },
              {
                label: "Log out",
                icon: <HiOutlineLogout className="h-4 w-4" />,
                variant: "danger",
                onClick: () => submit(null, { method: "post", action: "/logout" }),
              },
            ]}
          />
        ) : (
          <Link
            to="/login"
            aria-label="Sign in"
            title="Sign in"
            className="rounded-full outline-none ring-sky-400 transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            <Avatar name="Guest" size="sm" fullRound />
          </Link>
        )}
        </div>
      </div>
    </header>
  );
}
