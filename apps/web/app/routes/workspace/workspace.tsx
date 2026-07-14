// app/routes/workspaces.tsx
import { useState } from "react";
import { useLoaderData } from "react-router";
import {
  getWorkspaces,
  createWorkspace,
  deleteWorkspace,
} from "~/lib/api/workspace";
import { getErrorMessage } from "~/lib/api/client";
import { WorkspaceHeader } from "~/components/workspace/WorkspaceHeader";
import { WorkspaceGrid } from "~/components/workspace/WorkspaceGrid";
import { CreateWorkspaceDialog } from "~/components/workspace/CreateWorkspaceDialog";
import type { Route } from "./+types/workspace";
import { requireAccessToken } from "~/lib/api/auth.server";
import { EmptyWorkspaceState } from "~/components/workspace/EmptyWorkspace";
import type { CreateOrUpdateWorkspaceDto } from "@repo/shared";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Workspaces · Tsk Manager" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const token = await requireAccessToken(request); // redirects to /login if missing
  const workspaces = await getWorkspaces(token);
  return { workspaces };
}

export async function action({ request }: Route.ActionArgs) {
  const token = await requireAccessToken(request);
  const formData = await request.formData();
  const intent = formData.get("intent");

  try {
    if (intent === "create") {
      const payload: CreateOrUpdateWorkspaceDto = {
        name: String(formData.get("name") ?? "").trim(),
        logo: formData.get("logo") ? String(formData.get("logo")) : undefined,
      };
      await createWorkspace(token, payload);
      return { ok: true };
    }

    if (intent === "delete") {
      await deleteWorkspace(token, String(formData.get("workspaceId")));
      return { ok: true };
    }

    return { ok: false, message: "Unknown action" };
  } catch (error) {
    return { ok: false, message: getErrorMessage(error) };
  }
}

export default function WorkspacesPage() {
  const { workspaces } = useLoaderData<typeof loader>();
  const [isCreateOpen, setCreateOpen] = useState(false);

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <WorkspaceHeader onCreateClick={() => setCreateOpen(true)} />

        {workspaces.length === 0 ? (
          <EmptyWorkspaceState onCreateClick={() => setCreateOpen(true)} />
        ) : (
          <WorkspaceGrid workspaces={workspaces} />
        )}
      </div>

      <CreateWorkspaceDialog open={isCreateOpen} onClose={() => setCreateOpen(false)} />
    </main>
  );
}