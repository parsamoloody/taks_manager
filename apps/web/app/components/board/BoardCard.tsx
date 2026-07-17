// app/components/board/BoardCard.tsx
import { HiOutlineTrash } from "react-icons/hi";
import { Link, useFetcher } from "react-router";
import type { Board } from "~/lib/api/board";

const COVER_COLORS = [
  "from-sky-500/30 to-sky-500/5",
  "from-violet-500/30 to-violet-500/5",
  "from-emerald-500/30 to-emerald-500/5",
  "from-amber-500/30 to-amber-500/5",
  "from-rose-500/30 to-rose-500/5",
];

// app/components/board/BoardCard.tsx
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

  return (
    <div
      className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 transition hover:border-sky-400/30 hover:bg-white/10 ${isDeleting ? "pointer-events-none opacity-40" : ""
        }`}
    >
      <Link to={`/workspaces/${workspaceId}/board/${board.id}`} className="block">
        <div className={`h-20 bg-gradient-to-br ${coverFor(board.name)}`} />
        <div className="p-5">
          <h3 className="truncate text-base font-semibold text-white">{board.name}</h3>
          <p className="mt-1 text-sm text-slate-400">
            Updated {new Date(board.updatedAt).toLocaleDateString()}
          </p>
        </div>
      </Link>

      <fetcher.Form method="delete" className="absolute right-3 top-3">
        <input type="hidden" name="intent" value="delete" />
        <input type="hidden" name="boardId" value={board.id} />
        <button
          type="submit"
          onClick={(e) => {
            if (!confirm(`Delete "${board.name}"? This can't be undone.`)) {
              e.preventDefault();
            }
          }}
          aria-label={`Delete ${board.name}`}
          className="hidden cursor-pointer rounded-full bg-slate-950/60 p-1.5 text-slate-300 opacity-0 backdrop-blur transition hover:bg-rose-500/30 hover:text-rose-200 group-hover:opacity-100 sm:block"
        >
          <HiOutlineTrash className="h-4 w-4" />
        </button>
      </fetcher.Form>
    </div>
  );
}