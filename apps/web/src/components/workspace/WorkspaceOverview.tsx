import {
  HiOutlineCollection,
  HiOutlineLockClosed,
  HiOutlinePencil,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineUserGroup,
} from "react-icons/hi";
import { Avatar } from "~/components/ui/Avatar";
import { Breadcrumb } from "~/components/ui/Breadcrumb";
import { Button } from "~/components/ui/Button";
import { GroupMembers } from "~/components/ui/GroupMembers";
import { KebabMenu } from "~/components/ui/KebabMenu";
import type { Board } from "~/server/api/board";
import type { Workspace } from "~/server/api/workspace";

interface WorkspaceOverviewProps {
  workspace: Workspace;
  boards: Board[];
  currentUserId: string;
  onCreateBoard: () => void;
  onEditWorkspace: () => void;
  onDeleteWorkspace: () => void;
}

export function WorkspaceOverview({
  workspace,
  boards,
  currentUserId,
  onCreateBoard,
  onEditWorkspace,
  onDeleteWorkspace,
}: WorkspaceOverviewProps) {
  const members = workspace.members.map(({ user }) => ({
    id: user.id,
    avatar: user.avatar,
    name:
      [user.firstName, user.lastName].filter(Boolean).join(" ") ||
      user.email ||
      "Member",
  }));
  const currentMembership = workspace.members.find(
    (member) => member.userId === currentUserId,
  );
  const privateBoards = boards.filter(
    (board) => board.visibility === "PRIVATE",
  ).length;

  return (
    <header>
      <Breadcrumb
        items={[
          { label: "Workspaces", to: "/workspaces" },
          { label: workspace.name },
        ]}
      />

      <div className="relative mt-5 overflow-hidden rounded-[32px] border border-white/10 bg-slate-900/60 p-2 shadow-[0_30px_100px_-60px_rgba(139,92,246,0.55)] sm:p-4">
        <div className="pointer-events-none absolute -right-20 -top-28 h-80 w-80 rounded-full bg-violet-400/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-sky-400/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-4 sm:gap-5">
            <Avatar name={workspace.name} src={workspace.logo} size="lg" />
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300">
                Workspace
              </p>
              <h1 className="mt-1 truncate text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">
                {workspace.name}
              </h1>
              <p className="mt-2 text-sm text-slate-400">
                {boards.length} {boards.length === 1 ? "board" : "boards"} ·{" "}
                {members.length} {members.length === 1 ? "member" : "members"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <GroupMembers members={members} max={4} />
            <Button
              variant="primary"
              onClick={onCreateBoard}
              className="flex-1 sm:flex-none"
            >
              <HiOutlinePlus className="h-5 w-5" />
              New board
            </Button>
            <KebabMenu
              label={`Options for ${workspace.name}`}
              items={[
                {
                  label: "Edit workspace",
                  onClick: onEditWorkspace,
                  icon: <HiOutlinePencil className="h-4 w-4" />,
                },
                {
                  label: "Delete workspace",
                  icon: <HiOutlineTrash className="h-4 w-4" />,
                  variant: "danger",
                  onClick: onDeleteWorkspace,
                },
              ]}
            />
          </div>
        </div>

        {/* <div className="relative mt-8 grid gap-3 sm:grid-cols-3">
          {[
            {
              icon: HiOutlineCollection,
              value: boards.length,
              label: "total boards",
            },
            {
              icon: HiOutlineLockClosed,
              value: privateBoards,
              label: "private boards",
            },
            {
              icon: HiOutlineUserGroup,
              value: currentMembership?.role?.toLowerCase() ?? "member",
              label: "your workspace role",
            },
          ].map(({ icon: Icon, value, label }) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-slate-950/40 px-4 py-3.5"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.05] text-sky-200">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold capitalize text-white">
                  {value}
                </p>
                <p className="text-xs text-slate-500">{label}</p>
              </div>
            </div>
          ))}
        </div> */}
      </div>
    </header>
  );
}
