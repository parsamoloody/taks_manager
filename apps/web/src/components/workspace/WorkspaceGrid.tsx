import { WorkspaceCard } from "./WorkspaceCard";
import type { Workspace } from "~/server/api/workspace";

interface WorkspaceGridProps {
  workspaces: Workspace[];
  currentUserId: string;
}

export function WorkspaceGrid({
  workspaces,
  currentUserId,
}: WorkspaceGridProps) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,17rem),1fr))] gap-4">
      {workspaces.map((workspace) => (
        <WorkspaceCard
          key={workspace.id}
          workspace={workspace}
          currentUserId={currentUserId}
        />
      ))}
    </div>
  );
}
