import { BoardVisibility, TaskStatus, type TaskPriority } from "@repo/shared";
import { addBoardMember, removeBoardMember } from "~/server/api/board-member";
import { updateBoard } from "~/server/api/board";
import { getErrorMessage, isUnauthorizedError } from "~/server/api/client";
import { createLabel, deleteLabel, updateLabel } from "~/server/api/label";
import { createList, deleteList, updateList } from "~/server/api/list";
import { createTask, deleteTask, updateTask } from "~/server/api/task";
import {
  fieldNumber,
  fieldString,
  fieldStrings,
  fieldTrimmedString,
  type RequestFields,
} from "~/server/http/form";
import type { MutationResult } from "~/server/http/handlers";

function optionalDate(fields: RequestFields, name: string) {
  const value = fieldString(fields, name);
  return value ? new Date(value).toISOString() : undefined;
}

function nullableDate(fields: RequestFields, name: string) {
  const value = fieldString(fields, name);
  return value ? new Date(value).toISOString() : null;
}

function optionalPriority(fields: RequestFields) {
  const value = fieldString(fields, "priority");
  return value ? (value as TaskPriority) : undefined;
}

export async function mutateBoard(
  token: string,
  boardId: string,
  fields: RequestFields,
): Promise<MutationResult> {
  const intent = fieldString(fields, "intent");

  try {
    switch (intent) {
      case "createList": {
        await createList(token, boardId, {
          title: fieldTrimmedString(fields, "title"),
          order: fieldNumber(fields, "order"),
        });
        return { ok: true };
      }

      case "updateList": {
        await updateList(token, boardId, fieldString(fields, "listId"), {
          title: fieldTrimmedString(fields, "title"),
          order: fieldNumber(fields, "order"),
        });
        return { ok: true };
      }

      case "deleteList": {
        await deleteList(token, boardId, fieldString(fields, "listId"));
        return { ok: true };
      }

      case "createTask": {
        const listId = fieldString(fields, "listId");
        await createTask(token, boardId, listId, {
          title: fieldTrimmedString(fields, "title"),
          description: fieldString(fields, "description") || undefined,
          order: fieldNumber(fields, "order"),
          priority: optionalPriority(fields),
          dueDate: optionalDate(fields, "dueDate"),
          labels: fieldStrings(fields, "labelIds"),
          assignee: fieldStrings(fields, "assigneeIds"),
        });
        return { ok: true };
      }

      case "updateTask": {
        const listId = fieldString(fields, "listId");
        const taskId = fieldString(fields, "taskId");

        await updateTask(token, boardId, listId, taskId, {
          title: fieldTrimmedString(fields, "title"),
          description: fieldString(fields, "description"),
          order: fieldNumber(fields, "order"),
          priority: optionalPriority(fields),
          dueDate: nullableDate(fields, "dueDate"),
          startDate: nullableDate(fields, "startDate"),
          labels: fieldStrings(fields, "labelIds"),
          assignee: fieldStrings(fields, "assigneeIds"),
        });
        return { ok: true };
      }

      case "toggleStatus": {
        const listId = fieldString(fields, "listId");
        const taskId = fieldString(fields, "taskId");
        const nextStatus =
          fieldString(fields, "status") === TaskStatus.DONE
            ? TaskStatus.DONE
            : TaskStatus.PENDING;

        await updateTask(token, boardId, listId, taskId, {
          status: nextStatus,
        });
        return { ok: true };
      }

      case "deleteTask": {
        await deleteTask(
          token,
          boardId,
          fieldString(fields, "listId"),
          fieldString(fields, "taskId"),
        );
        return { ok: true };
      }

      case "updateBoard": {
        await updateBoard(token, boardId, {
          name: fieldTrimmedString(fields, "name"),
          description: fieldString(fields, "description"),
          visibility:
            fieldString(fields, "visibility") === BoardVisibility.PRIVATE
              ? BoardVisibility.PRIVATE
              : BoardVisibility.WORKSPACE,
        });
        return { ok: true, intent };
      }

      case "addBoardMember": {
        await addBoardMember(token, boardId, {
          email: fieldTrimmedString(fields, "email"),
        });
        return { ok: true, intent };
      }

      case "removeBoardMember": {
        await removeBoardMember(token, boardId, fieldString(fields, "userId"));
        return { ok: true, intent };
      }

      case "createLabel": {
        await createLabel(token, boardId, {
          name: fieldTrimmedString(fields, "name"),
          color: fieldString(fields, "color"),
        });
        return { ok: true, intent };
      }

      case "updateLabel": {
        await updateLabel(token, boardId, fieldString(fields, "labelId"), {
          name: fieldTrimmedString(fields, "name"),
          color: fieldString(fields, "color"),
        });
        return { ok: true, intent };
      }

      case "deleteLabel": {
        await deleteLabel(token, boardId, fieldString(fields, "labelId"));
        return { ok: true, intent };
      }

      default:
        return { ok: false, message: "Unknown action" };
    }
  } catch (error) {
    if (isUnauthorizedError(error)) throw error;
    return { ok: false, message: getErrorMessage(error) };
  }
}
