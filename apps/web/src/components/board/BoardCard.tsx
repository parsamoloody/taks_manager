import Link from "next/link";
import {
  HiArrowRight,
  HiOutlineCollection,
  HiOutlineLockClosed,
  HiOutlineUserGroup,
} from "react-icons/hi";
import type { Board } from "~/server/api/board";
import { GroupMembers } from "~/components/ui/GroupMembers";
import { Badge } from "../ui/Badge";

const COVER_COLORS = [
  "from-sky-500/30 to-sky-500/5",
  "from-violet-500/30 to-violet-500/5",
  "from-emerald-500/30 to-emerald-500/5",
  "from-amber-500/30 to-amber-500/5",
  "from-rose-500/30 to-rose-500/5",
];

function coverFor(title: string) {
  const safeTitle = title || "?";
  const index = safeTitle.charCodeAt(0) % COVER_COLORS.length;
  return COVER_COLORS[index];
}

interface BoardCardProps {
  board: Board;
  workspaceId: string;
}

export function BoardCard({ board, workspaceId }: BoardCardProps) {
  const members = board.members.map(({ user }) => ({
    id: user.id,
    avatar: user.avatar,
    name:
      [user.firstName, user.lastName].filter(Boolean).join(" ") ||
      user.email ||
      "Member",
  }));

  return (
    <article className="group relative min-h-64 overflow-hidden rounded-[24px] border border-white/10 bg-slate-900/65 transition duration-300 hover:-translate-y-1 hover:border-sky-300/25 hover:shadow-[0_26px_70px_-38px_rgba(56,189,248,0.5)] focus-within:border-sky-300/40 motion-reduce:transform-none">
      <Link
        href={`/workspaces/${workspaceId}/board/${board.id}`}
        className="flex h-full min-h-64 flex-col outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-300"
      >
        <div
          className={`relative h-24 overflow-hidden bg-gradient-to-br ${coverFor(board.name)}`}
        >
          <div className="landing-grid absolute inset-0 opacity-30" />
          <span className="absolute bottom-3 left-4 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-slate-950/55 text-sky-100 backdrop-blur">
            <HiOutlineCollection className="h-5 w-5" />
          </span>
          {board.visibility === "PRIVATE" ? (
            <Badge className="absolute right-3 top-3 border-violet-300/20 bg-slate-950/50 text-violet-100">
              <HiOutlineLockClosed className="mr-1 h-3 w-3" />
              Private
            </Badge>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="truncate text-lg font-semibold tracking-tight text-white">
                {board.name}
              </h2>
              <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                {board.description?.trim() ||
                  "A focused place to move this project forward."}
              </p>
            </div>
            <GroupMembers members={members} max={3} size="xs" />
          </div>

          <div className="mt-auto flex items-center justify-between border-t border-white/[0.08] pt-4">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
              <HiOutlineUserGroup className="h-3.5 w-3.5 text-sky-300" />
              {members.length} {members.length === 1 ? "member" : "members"}
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.06] text-sky-200 transition group-hover:translate-x-0.5 group-hover:bg-sky-400/15 motion-reduce:transform-none">
              <HiArrowRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
