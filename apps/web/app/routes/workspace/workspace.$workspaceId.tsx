// app/routes/workspace.$workspaceId.tsx
import { useState } from "react";
import { redirect, useFetcher, useLoaderData } from "react-router";
import { deleteWorkspace, getWorkspaces } from "~/lib/api/workspace";
import {
  getBoards,
  createBoard,
  deleteBoard,
} from "~/lib/api/board";
import { getErrorMessage } from "~/lib/api/client";
import { Button } from "~/components/ui/Button";
import { BoardGrid } from "~/components/board/BoardGrid";
import { CreateBoardDialog } from "~/components/board/CreateBoardDialog";
import { requireAccessToken } from "~/lib/api/auth.server";
import { Breadcrumb } from "~/components/ui/BreadCriumb";
import { EmptyBoardState } from "~/components/board/EmptyBoard";
import type { Route } from "./+types/workspace.$workspaceId";
import type { CreateBoardDto } from "@repo/shared";
import { BoardVisibility } from "@repo/shared";
import { KebabMenu } from "~/components/ui/KebabMenu";
import { HiOutlinePencil, HiOutlineTrash } from "react-icons/hi";
import { DeleteWorkspaceDialog } from "~/components/workspace/DeleteWorkspaceDialog";

export function meta({ data }: Route.MetaArgs) {
  return [{ title: `${data?.workspaceName ?? "Workspace"} · Tsk Manager` }];
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const token = await requireAccessToken(request);
  const workspaceId = params.workspaceId!;

  const [workspaces, boards] = await Promise.all([
    getWorkspaces(token),
    getBoards(token, workspaceId),
  ]);

  const workspace = workspaces.find((w) => w.id === workspaceId);

  return {
    workspaceId,
    workspaceName: workspace?.name ?? "Workspace",
    boards,
  };
}

export async function action({ request, params }: Route.ActionArgs) {
  const token = await requireAccessToken(request);
  const workspaceId = params.workspaceId!;
  const formData = await request.formData();
  const intent = formData.get("intent");
  const target = formData.get("target");


  console.log("params:", params)
  try {
    if (intent === "create") {
      const payload: CreateBoardDto = {
        name: String(formData.get("name") ?? "").trim(),
        visibility: BoardVisibility.WORKSPACE,
      };
      await createBoard(token, workspaceId, payload);
      return { ok: true };
    }

    if (intent === "delete" && target === 'workspace') {
      await deleteWorkspace(token, workspaceId)
      return { ok: true };
    }

    if (intent === "delete") {
      const boardId = String(formData.get("boardId"));
      await deleteBoard(token, workspaceId, boardId);
      return { ok: true };
    }

    return { ok: false, message: "Unknown action" };
  } catch (error) {
    return { ok: false, message: getErrorMessage(error) };
  }
}

export default function WorkspaceBoardsPage() {
  const { workspaceId, workspaceName, boards } = useLoaderData<typeof loader>();
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const fetcher = useFetcher();
  const isDeleting = fetcher.state !== "idle" && fetcher.formData?.get("workspaceId") === workspaceId;
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="space-y-4 border-b border-white/10 pb-6">
          <Breadcrumb
            items={[
              { label: "Workspaces", to: "/workspaces" },
              { label: workspaceName },
            ]}
          />

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl font-semibold text-white sm:text-3xl">{workspaceName}</h1>
            <div className="flex gap-x-2">
              <Button variant="primary" onClick={() => setCreateOpen(true)} className="self-start sm:self-auto">
                + New board
              </Button>
              <div className="flex items-center gap-1 w-auto">
                <KebabMenu
                  label={`List options for ${workspaceId}`}
                  items={[
                    {
                      label: "Edit workspace",
                      onClick: () => { },
                      icon: <HiOutlinePencil className="h-4 w-4" />
                    },
                    {
                      label: "Delete workspace",
                      icon: <HiOutlineTrash className="h-4 w-4" />,
                      variant: "danger",
                      onClick: () => setOpenDeleteDialog(true)
                    },
                  ]}
                />
              </div>
            </div>
          </div>
        </div>

        {boards.length === 0 ? (
          <EmptyBoardState onCreateClick={() => setCreateOpen(true)} />
        ) : (
          <BoardGrid boards={boards} workspaceId={workspaceId} />
        )}
      </div>

      <DeleteWorkspaceDialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)} workspaceName={workspaceId} workspaceId={workspaceId} />
      <CreateBoardDialog open={isCreateOpen} onClose={() => setCreateOpen(false)} />
    </main>
  );
}