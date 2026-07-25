import type { CreateOrUpdateWorkspaceDto } from "@repo/shared";
import { createWorkspace, deleteWorkspace } from "~/server/api/workspace";
import { getErrorMessage, isUnauthorizedError } from "~/server/api/client";
import {
  fieldString,
  fieldTrimmedString,
  type RequestFields,
} from "~/server/http/form";
import type { MutationResult } from "~/server/http/handlers";

export async function mutateWorkspaces(
  token: string,
  fields: RequestFields,
): Promise<MutationResult> {
  const intent = fieldString(fields, "intent");

  try {
    if (intent === "create") {
      const logo = fieldString(fields, "logo");
      const payload: CreateOrUpdateWorkspaceDto = {
        name: fieldTrimmedString(fields, "name"),
        logo: logo ? logo : undefined,
      };
      await createWorkspace(token, payload);
      return { ok: true };
    }

    if (intent === "delete") {
      await deleteWorkspace(token, fieldString(fields, "workspaceId"));
      return { ok: true };
    }

    return { ok: false, message: "Unknown action" };
  } catch (error) {
    if (isUnauthorizedError(error)) throw error;
    return { ok: false, message: getErrorMessage(error) };
  }
}
