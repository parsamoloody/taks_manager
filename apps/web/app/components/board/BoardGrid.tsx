// app/components/board/BoardGrid.tsx
import { BoardCard } from "./BoardCard";
import type { Board } from "~/lib/api/board";

interface BoardGridProps {
  boards: Board[];
  workspaceId: string;
}

export function BoardGrid({ boards, workspaceId }: BoardGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {boards.map((board) => (
        <BoardCard key={board.id} board={board} workspaceId={workspaceId} />
      ))}
    </div>
  );
}