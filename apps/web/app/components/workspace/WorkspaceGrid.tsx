// app/components/workspace/WorkspaceGrid.tsx
import { WorkspaceCard } from "./WorkspaceCard";
import type { Workspace } from "~/lib/api/workspace";

interface WorkspaceGridProps {
  workspaces: Workspace[];
}

export function WorkspaceGrid({ workspaces }: WorkspaceGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {workspaces.map((workspace) => (
        <WorkspaceCard key={workspace.id} workspace={workspace} />
      ))}
    </div>
  );
}