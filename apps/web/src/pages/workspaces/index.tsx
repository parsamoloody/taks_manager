import { useMemo, useState } from "react";
import type { GetServerSideProps } from "next";
import dynamic from "next/dynamic";
import Head from "next/head";
import type { UserDto } from "@repo/shared";
import { HiOutlineSearch } from "react-icons/hi";
import { EmptyWorkspaceState } from "~/components/workspace/EmptyWorkspace";
import { WorkspaceGrid } from "~/components/workspace/WorkspaceGrid";
import { WorkspaceHeader } from "~/components/workspace/WorkspaceHeader";
import { MutationProvider } from "~/modules/mutations/client";
import { getCurrentUser } from "~/server/api/user";
import { getWorkspaces, type Workspace } from "~/server/api/workspace";
import { loadProtectedPage } from "~/server/auth/page";

const CreateWorkspaceDialog = dynamic(
  () =>
    import("~/components/workspace/CreateWorkspaceDialog").then(
      (module) => module.CreateWorkspaceDialog,
    ),
  { ssr: false },
);

interface WorkspacesPageProps {
  user: UserDto;
  workspaces: Workspace[];
}

export const getServerSideProps: GetServerSideProps<
  WorkspacesPageProps
> = async (context) =>
  loadProtectedPage(context, async (token) => {
    const [user, workspaces] = await Promise.all([
      getCurrentUser(token),
      getWorkspaces(token),
    ]);

    return { user, workspaces };
  });

export default function WorkspacesPage({
  user,
  workspaces,
}: WorkspacesPageProps) {
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [query, setQuery] = useState("");
  const filteredWorkspaces = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    if (!normalizedQuery) return workspaces;

    return workspaces.filter((workspace) =>
      workspace.name.toLocaleLowerCase().includes(normalizedQuery),
    );
  }, [query, workspaces]);

  return (
    <MutationProvider endpoint="/api/mutations/workspaces">
      <Head>
        <title>Workspaces · Tsk Manager</title>
      </Head>
      <main
        id="main-content"
        className="product-grid min-h-[calc(100dvh-4rem)] bg-slate-950 px-4 py-6 text-white sm:px-6 sm:py-10 lg:px-8"
      >
        <div className="mx-auto max-w-7xl space-y-8">
          <WorkspaceHeader
            user={user}
            workspaces={workspaces}
            onCreateClick={() => setCreateOpen(true)}
          />

          {workspaces.length === 0 ? (
            <EmptyWorkspaceState onCreateClick={() => setCreateOpen(true)} />
          ) : (
            <section aria-labelledby="workspace-list-title">
              <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Your spaces
                  </p>
                  <h2
                    id="workspace-list-title"
                    className="mt-1 text-2xl font-semibold tracking-tight text-white"
                  >
                    Workspaces
                  </h2>
                </div>
                <label className="relative block w-full sm:max-w-xs">
                  <span className="sr-only">Search workspaces</span>
                  <HiOutlineSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search workspaces"
                    className="min-h-11 w-full rounded-xl border border-white/10 bg-slate-900/75 py-2.5 pl-10 pr-3 text-sm text-white outline-none transition placeholder:text-slate-600 hover:border-white/20 focus:border-sky-300/45 focus:ring-2 focus:ring-sky-300/15"
                  />
                </label>
              </div>

              {filteredWorkspaces.length > 0 ? (
                <WorkspaceGrid
                  workspaces={filteredWorkspaces}
                  currentUserId={user.id}
                />
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.025] px-6 py-12 text-center">
                  <p className="text-sm font-medium text-slate-300">
                    No workspaces match “{query.trim()}”
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

        {isCreateOpen ? (
          <CreateWorkspaceDialog open onClose={() => setCreateOpen(false)} />
        ) : null}
      </main>
    </MutationProvider>
  );
}
