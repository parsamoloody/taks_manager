import Link from "next/link";
import {
  HiArrowRight,
  HiOutlineShieldCheck,
  HiOutlineUserGroup,
} from "react-icons/hi";
import { Avatar } from "~/components/ui/Avatar";
import { GroupMembers } from "~/components/ui/GroupMembers";
import type { Workspace } from "~/server/api/workspace";

const CARD_ACCENTS = [
  "from-sky-400/20 via-sky-400/[0.04] to-transparent",
  "from-violet-400/20 via-violet-400/[0.04] to-transparent",
  "from-emerald-400/20 via-emerald-400/[0.04] to-transparent",
  "from-amber-400/20 via-amber-400/[0.04] to-transparent",
  "from-rose-400/20 via-rose-400/[0.04] to-transparent",
] as const;

function accentFor(value: string) {
  const hash = Array.from(value).reduce(
    (total, character) => total + character.charCodeAt(0),
    0,
  );
  return CARD_ACCENTS[hash % CARD_ACCENTS.length];
}

interface WorkspaceCardProps {
  workspace: Workspace;
  currentUserId: string;
}

export function WorkspaceCard({
  workspace,
  currentUserId,
}: WorkspaceCardProps) {
  const members = workspace.members.map(({ user }) => ({
    id: user.id,
    avatar: user.avatar,
    name:
      [user.firstName, user.lastName].filter(Boolean).join(" ") ||
      user.email ||
      "Member",
  }));
  const currentMembership = workspace.members.find(
    (member) => member.userId === currentUserId,
  );
  const role = currentMembership?.role?.toLowerCase() ?? "member";

  return (
    <article className="group relative min-h-56 overflow-hidden rounded-[24px] border border-white/10 bg-slate-900/65 transition duration-300 hover:-translate-y-1 hover:border-sky-300/25 hover:shadow-[0_26px_70px_-38px_rgba(56,189,248,0.55)] focus-within:border-sky-300/40 motion-reduce:transform-none">
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${accentFor(workspace.name)} opacity-70 transition duration-300 group-hover:opacity-100`}
      />
      <Link
        href={`/workspaces/${workspace.id}`}
        className="relative flex h-full min-h-56 flex-col p-5 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-300"
      >
        <div className="flex items-start justify-between gap-4">
          <Avatar name={workspace.name} src={workspace.logo} size="lg" />
          <GroupMembers members={members} max={3} />
        </div>

        <div className="mt-6 flex-1">
          <h2 className="truncate text-lg font-semibold tracking-tight text-white">
            {workspace.name}
          </h2>
          <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-medium text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <HiOutlineUserGroup className="h-3.5 w-3.5 text-sky-300" />
              {members.length} {members.length === 1 ? "member" : "members"}
            </span>
            <span className="inline-flex items-center gap-1.5 capitalize">
              <HiOutlineShieldCheck className="h-3.5 w-3.5 text-violet-300" />
              {role}
            </span>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-white/[0.08] pt-4">
          <span className="text-xs font-semibold text-slate-300">
            Open workspace
          </span>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.06] text-sky-200 transition group-hover:translate-x-0.5 group-hover:bg-sky-400/15 motion-reduce:transform-none">
            <HiArrowRight className="h-4 w-4" />
          </span>
        </div>
      </Link>
    </article>
  );
}
