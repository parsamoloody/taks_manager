import { useMemo, useState } from "react";
import type { GetServerSideProps } from "next";
import dynamic from "next/dynamic";
import Head from "next/head";
import type { UserDto } from "@repo/shared";
import { HiOutlineSearch } from "react-icons/hi";
import { BoardGrid } from "~/components/board/BoardGrid";
import { EmptyBoardState } from "~/components/board/EmptyBoard";
import { WorkspaceOverview } from "~/components/workspace/WorkspaceOverview";
import { MutationProvider } from "~/modules/mutations/client";
import { getBoards, type Board } from "~/server/api/board";
import { getCurrentUser } from "~/server/api/user";
import { getWorkspace, type Workspace } from "~/server/api/workspace";
import { loadProtectedPage } from "~/server/auth/page";

const CreateBoardDialog = dynamic(
  () =>
    import("~/components/board/CreateBoardDialog").then(
      (module) => module.CreateBoardDialog,
    ),
  { ssr: false },
);
const DeleteWorkspaceDialog = dynamic(
  () =>
    import("~/components/workspace/DeleteWorkspaceDialog").then(
      (module) => module.DeleteWorkspaceDialog,
    ),
  { ssr: false },
);
const EditWorkspaceDialog = dynamic(
  () =>
    import("~/components/workspace/EditWorkspaceDialog").then(
      (module) => module.EditWorkspaceDialog,
    ),
  { ssr: false },
);

interface WorkspacePageProps {
  user: UserDto;
  workspace: Workspace;
  boards: Board[];
}

export const getServerSideProps: GetServerSideProps<
  WorkspacePageProps
> = async (context) =>
  loadProtectedPage(context, async (token) => {
    const workspaceId = context.params?.workspaceId;
    if (typeof workspaceId !== "string" || !workspaceId) return null;

    const [user, workspace, boards] = await Promise.all([
      getCurrentUser(token),
      getWorkspace(token, workspaceId),
      getBoards(token, workspaceId),
    ]);

    return { user, workspace, boards };
  });

export default function WorkspacePage({
  user,
  workspace,
  boards,
}: WorkspacePageProps) {
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [isDeleteOpen, setDeleteOpen] = useState(false);
  const [isEditOpen, setEditOpen] = useState(false);
  const [query, setQuery] = useState("");
  const mutationEndpoint = `/api/mutations/workspaces/${workspace.id}`;
  const filteredBoards = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    if (!normalizedQuery) return boards;

    return boards.filter((board) =>
      [board.name, board.description ?? ""].some((value) =>
        value.toLocaleLowerCase().includes(normalizedQuery),
      ),
    );
  }, [boards, query]);

  return (
    <MutationProvider endpoint={mutationEndpoint}>
      <Head>
        <title>{workspace.name} · Tsk Manager</title>
      </Head>
      <main
        id="main-content"
        className="product-grid min-h-[calc(100dvh-4rem)] bg-slate-950 px-4 py-6 text-white sm:px-6 sm:py-10 lg:px-8"
      >
        <div className="mx-auto max-w-7xl space-y-8">
          <WorkspaceOverview
            workspace={workspace}
            boards={boards}
            currentUserId={user.id}
            onCreateBoard={() => setCreateOpen(true)}
            onEditWorkspace={() => setEditOpen(true)}
            onDeleteWorkspace={() => setDeleteOpen(true)}
          />

          {boards.length === 0 ? (
            <EmptyBoardState onCreateClick={() => setCreateOpen(true)} />
          ) : (
            <section aria-labelledby="board-list-title">
              <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Plan and progress
                  </p>
                  <h2
                    id="board-list-title"
                    className="mt-1 text-2xl font-semibold tracking-tight text-white"
                  >
                    Boards
                  </h2>
                </div>
                <label className="relative block w-full sm:max-w-xs">
                  <span className="sr-only">Search boards</span>
                  <HiOutlineSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search boards"
                    className="min-h-11 w-full rounded-xl border border-white/10 bg-slate-900/75 py-2.5 pl-10 pr-3 text-sm text-white outline-none transition placeholder:text-slate-600 hover:border-white/20 focus:border-sky-300/45 focus:ring-2 focus:ring-sky-300/15"
                  />
                </label>
              </div>

              {filteredBoards.length > 0 ? (
                <BoardGrid boards={filteredBoards} workspaceId={workspace.id} />
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.025] px-6 py-12 text-center">
                  <p className="text-sm font-medium text-slate-300">
                    No boards match “{query.trim()}”
                  </p>
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="mt-2 rounded-md text-sm font-semibold text-sky-300 outline-none hover:text-sky-200 focus-visible:ring-2 focus-visible:ring-sky-300"
                  >
                    Clear search
                  </button>
                </div>
              )}
            </section>
          )}
        </div>

        {isDeleteOpen ? (
          <DeleteWorkspaceDialog
            open
            onClose={() => setDeleteOpen(false)}
            workspaceName={workspace.name}
            workspaceId={workspace.id}
          />
        ) : null}
        {isEditOpen ? (
          <EditWorkspaceDialog
            open
            onClose={() => setEditOpen(false)}
            workspace={workspace}
          />
        ) : null}
        {isCreateOpen ? (
          <CreateBoardDialog open onClose={() => setCreateOpen(false)} />
        ) : null}
      </main>
    </MutationProvider>
  );
}
