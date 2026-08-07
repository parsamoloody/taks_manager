import type { UserDto } from "@repo/shared";
import {
  HiOutlineLightningBolt,
  HiOutlinePlus,
  HiOutlineUserGroup,
  HiOutlineViewGrid,
} from "react-icons/hi";
import { Button } from "~/components/ui/Button";
import type { Workspace } from "~/server/api/workspace";

interface WorkspaceHeaderProps {
  user: UserDto;
  workspaces: Workspace[];
  onCreateClick: () => void;
}

export function WorkspaceHeader({
  user,
  workspaces,
  onCreateClick,
}: WorkspaceHeaderProps) {
  const firstName = user.firstName?.trim();
  const collaboratorCount = new Set(
    workspaces.flatMap((workspace) =>
      workspace.members.map((member) => member.userId),
    ),
  ).size;

  return (
    <header className="relative overflow-hidden rounded-[32px] border border-white/10 bg-slate-900/55 p-4 sm:p-6">
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-sky-400/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />

      <div className="relative flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-300">
            Workspace overview
          </p>
          <h1 className="mt-3 text-balance text-3xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">
            {firstName
              ? `Build something clear, ${firstName}.`
              : "Build something clear."}
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
            Keep teams, projects, and decisions organized in a focused home for
            your work.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={onCreateClick}
          className="w-full shrink-0 sm:w-auto"
        >
          <HiOutlinePlus className="h-5 w-5" />
          New workspace
        </Button>
      </div>

      {/* <div className="relative mt-8 grid gap-3 sm:grid-cols-3">
        {[
          {
            icon: HiOutlineViewGrid,
            value: workspaces.length,
            label: `workspace${workspaces.length === 1 ? "" : "s"}`,
          },
          {
            icon: HiOutlineUserGroup,
            value: collaboratorCount,
            label: `collaborator${collaboratorCount === 1 ? "" : "s"}`,
          },
          {
            icon: HiOutlineLightningBolt,
            value: "Ready",
            label: "for your next idea",
          },
        ].map(({ icon: Icon, value, label }) => (
          <div
            key={label}
            className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-slate-950/45 px-4 py-3.5"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-400/10 text-sky-200">
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-white">{value}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </div> */}
    </header>
  );
}
