// app/components/workspace/WorkspaceHeader.tsx
import { Button } from "~/components/ui/Button";

interface WorkspaceHeaderProps {
  onCreateClick: () => void;
}

export function WorkspaceHeader({ onCreateClick }: WorkspaceHeaderProps) {
  return (
    <header className="flex flex-col gap-4 pb-6 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="inline-flex rounded-full border border-sky-400/30 bg-sky-400/10 px-3 py-1 text-xs font-medium text-sky-200">
          Your workspaces
        </p>
      </div>

      <div className="flex items-center self-stretch sm:self-auto">
        <Button variant="primary" onClick={onCreateClick} className="flex-1 sm:flex-none h-10">
          + New workspace
        </Button>
      </div>
    </header>
  );
}
