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
        <h1 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
          Pick a workspace to jump into
        </h1>
      </div>

      <div className="flex items-center gap-3 self-stretch sm:self-auto">
        <Button variant="primary" onClick={onCreateClick} className="flex-1 sm:flex-none">
          + New workspace
        </Button>

        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
          {/* <Avatar name={userEmail} size="sm" /> */}
          <span className="hidden text-sm text-slate-300 sm:block">{"mail"}</span>
          <Form method="post" action="/logout">
            <button
              type="submit"
              className="text-sm font-medium text-slate-400 transition hover:text-white"
            >
              Log out
            </button>
          </Form>
        </div>
      </div>
    </header>
  );
}