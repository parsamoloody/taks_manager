import { HiOutlineCollection, HiOutlinePlus } from "react-icons/hi";
import { Button } from "~/components/ui/Button";

interface EmptyBoardStateProps {
  onCreateClick: () => void;
}

export function EmptyBoardState({ onCreateClick }: EmptyBoardStateProps) {
  return (
    <div className="relative flex flex-col items-center overflow-hidden rounded-[28px] border border-dashed border-white/15 bg-slate-900/45 px-6 py-16 text-center">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(139,92,246,0.11),_transparent_48%)]" />
      <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-400/10 text-violet-200 ring-1 ring-violet-300/15">
        <HiOutlineCollection className="h-8 w-8" />
      </div>
      <h2 className="relative mt-5 text-xl font-semibold text-white">
        Create the first board
      </h2>
      <p className="relative mt-2 max-w-sm text-sm leading-6 text-slate-400">
        Create a board to start organizing tasks for this workspace.
      </p>
      <Button
        variant="primary"
        onClick={onCreateClick}
        className="relative mt-6"
      >
        <HiOutlinePlus className="h-5 w-5" />
        Create board
      </Button>
    </div>
  );
}
