import {
  BoardVisibility,
  type CreateBoardDto,
  type CreateOrUpdateWorkspaceDto,
} from "@repo/shared";
import { createBoard } from "~/server/api/board";
import { getErrorMessage, isUnauthorizedError } from "~/server/api/client";
import {
  deleteWorkspace,
  inviteWorkspaceMember,
  removeWorkspaceMember,
  updateWorkspace,
} from "~/server/api/workspace";
import {
  fieldString,
  fieldTrimmedString,
  type RequestFields,
} from "~/server/http/form";
import type { MutationResult } from "~/server/http/handlers";

export async function mutateWorkspace(
  token: string,
  workspaceId: string,
  fields: RequestFields,
): Promise<MutationResult> {
  const intent = fieldString(fields, "intent");
  const target = fieldString(fields, "target");

  try {
    if (intent === "create") {
      const payload: CreateBoardDto = {
        name: fieldTrimmedString(fields, "name"),
        description: fieldTrimmedString(fields, "description") || undefined,
        visibility:
          fieldString(fields, "visibility") === BoardVisibility.PRIVATE
            ? BoardVisibility.PRIVATE
            : BoardVisibility.WORKSPACE,
      };
      await createBoard(token, workspaceId, payload);
      return { ok: true };
    }

    if (intent === "delete" && target === "workspace") {
      await deleteWorkspace(token, workspaceId);
      return { ok: true, redirectTo: "/workspaces" };
    }

    if (intent === "update-workspace") {
      const payload: CreateOrUpdateWorkspaceDto = {
        name: fieldTrimmedString(fields, "name"),
        logo: fieldTrimmedString(fields, "logo"),
      };
      await updateWorkspace(token, workspaceId, payload);
      return { ok: true, intent };
    }

    if (intent === "invite-member") {
      const email = fieldTrimmedString(fields, "email").toLowerCase();
      await inviteWorkspaceMember(token, workspaceId, {
        email,
      });
      return {
        ok: true,
        intent,
        message: `Invitation request sent to ${email}.`,
      };
    }

    if (intent === "remove-member") {
      await removeWorkspaceMember(
        token,
        workspaceId,
        fieldString(fields, "userId"),
      );
      return { ok: true, intent };
    }

    return { ok: false, message: "Unknown action" };
  } catch (error) {
    if (isUnauthorizedError(error)) throw error;
    return { ok: false, intent, message: getErrorMessage(error) };
  }
}
