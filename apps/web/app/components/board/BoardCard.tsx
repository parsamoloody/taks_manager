import { Link, useFetcher } from "react-router";
import type { Board } from "~/lib/api/board";
import { GroupMembers } from "~/components/ui/GroutMembers";
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
  const fetcher = useFetcher();
  const isDeleting = fetcher.state !== "idle" && fetcher.formData?.get("boardId") === board.id;
  const members = board.members.map(({ user }) => ({
    id: user.id,
    avatar: user.avatar,
    name: [user.firstName, user.lastName].filter(Boolean).join(" ") || "User",
  }));
  console.log(board)
  return (
    <div
      className={`group relative overflow-hidden rounded-md border border-white/10 bg-white/5 transition hover:border-sky-400/30 hover:bg-white/10 ${isDeleting ? "pointer-events-none opacity-40" : ""
        }`}
    >
      {board.visibility === 'PRIVATE' && (
        <Badge>Private</Badge>
      )}
      <Link to={`/workspaces/${workspaceId}/board/${board.id}`} className="block">
        <div className={`h-20 bg-gradient-to-br ${coverFor(board.name)}`} />
        <div className="p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="truncate text-base font-semibold text-white">{board.name}</h3>
            <GroupMembers members={members} />
          </div>
        </div>
      </Link>
    </div>
  );
}
