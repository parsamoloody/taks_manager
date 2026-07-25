import { HiOutlinePlus, HiOutlineViewGrid } from "react-icons/hi";
import { Button } from "~/components/ui/Button";

interface EmptyWorkspaceStateProps {
  onCreateClick: () => void;
}

export function EmptyWorkspaceState({
  onCreateClick,
}: EmptyWorkspaceStateProps) {
  return (
    <div className="relative flex flex-col items-center overflow-hidden rounded-[28px] border border-dashed border-white/15 bg-slate-900/45 px-6 py-16 text-center">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.1),_transparent_48%)]" />
      <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-400/10 text-sky-200 ring-1 ring-sky-300/15">
        <HiOutlineViewGrid className="h-8 w-8" />
      </div>
      <h2 className="relative mt-5 text-xl font-semibold text-white">
        Your first workspace starts here
      </h2>
      <p className="relative mt-2 max-w-sm text-sm leading-6 text-slate-400">
        Create your first workspace to start organizing tasks with your team.
      </p>
      <Button
        variant="primary"
        onClick={onCreateClick}
        className="relative mt-6"
      >
        <HiOutlinePlus className="h-5 w-5" />
        Create workspace
      </Button>
    </div>
  );
}
