import { BoardCard } from "./BoardCard";
import type { Board } from "~/server/api/board";

interface BoardGridProps {
  boards: Board[];
  workspaceId: string;
}

export function BoardGrid({ boards, workspaceId }: BoardGridProps) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,17rem),1fr))] gap-4">
      {boards.map((board) => (
        <BoardCard key={board.id} board={board} workspaceId={workspaceId} />
      ))}
    </div>
  );
}
