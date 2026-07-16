// app/lib/api/task.ts
import { TaskPriority, TaskStatus } from "@repo/shared";
import { requestJson } from "./client";

export interface Task {
  id: string;
  listId: string;
  title: string;
  description?: string | null;
  order: number;
  priority: TaskPriority;
  status: TaskStatus;
  startDate?: string | null;
  dueDate?: string | null;
  assignee?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TaskFormValues {
  title: string;
  description?: string;
  order: number;
  priority?: TaskPriority;
  startDate?: string;
  dueDate?: string;
  assignee?: string[];
}

export interface UpdateTaskPayload extends TaskFormValues {
  status?: TaskStatus;
}

export function getTasks(token: string, boardId: string, listId: string) {
  return requestJson<Task[]>(`task/${boardId}/${listId}`, { method: "GET", token });
}

export function getTask(token: string, boardId: string, listId: string, taskId: string) {
  return requestJson<Task>(`task/${boardId}/${listId}/${taskId}`, { method: "GET", token });
}

export function createTask(token: string, boardId: string, listId: string, payload: TaskFormValues) {
  return requestJson<Task>(`task/${boardId}/${listId}`, { method: "POST", json: payload, token });
}

export function updateTask(
  token: string,
  boardId: string,
  listId: string,
  taskId: string,
  payload: UpdateTaskPayload,
) {
  return requestJson<Task>(`task/${boardId}/${listId}/${taskId}`, {
    method: "PUT",
    json: payload,
    token,
  });
}

export function deleteTask(token: string, boardId: string, listId: string, taskId: string) {
  return requestJson<void>(`task/${boardId}/${listId}/${taskId}`, { method: "DELETE", token });
}