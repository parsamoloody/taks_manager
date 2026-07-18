// app/components/workspace/WorkspaceHeader.tsx
import { Form } from "react-router";
import { Avatar } from "~/components/ui/Avatar";
import { Button } from "~/components/ui/Button";

interface WorkspaceHeaderProps {
  onCreateClick: () => void;
}

export function WorkspaceHeader({ onCreateClick }: WorkspaceHeaderProps) {
  return (
    <header className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="inline-flex rounded-full border border-sky-400/30 bg-sky-400/10 px-3 py-1 text-xs font-medium text-sky-200">
          Your workspaces
        </p>
      </div>

      <div className="flex items-center gap-1.5 self-stretch sm:self-auto">
        <Button variant="primary" onClick={onCreateClick} className="flex-1 sm:flex-none h-10">
          + New workspace
        </Button>

        <div className="flex items-center gap-1 rounded-md px-3 py-1">
          <Avatar name={'my profile'} size="sm" />
        </div>
      </div>
    </header>
  );
}