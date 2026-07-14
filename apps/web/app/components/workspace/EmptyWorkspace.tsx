// app/components/workspace/EmptyWorkspaceState.tsx
import { Button } from "~/components/ui/Button";

interface EmptyWorkspaceStateProps {
  onCreateClick: () => void;
}

export function EmptyWorkspaceState({ onCreateClick }: EmptyWorkspaceStateProps) {
  return (
    <div className="flex flex-col items-center rounded-[28px] border border-dashed border-white/15 bg-white/5 px-6 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-400/10 text-3xl">
        📋
      </div>
      <h2 className="mt-5 text-lg font-semibold text-white">No workspaces yet</h2>
      <p className="mt-2 max-w-sm text-sm text-slate-400">
        Create your first workspace to start organizing tasks with your team.
      </p>
      <Button variant="primary" onClick={onCreateClick} className="mt-6">
        + Create workspace
      </Button>
    </div>
  );
}