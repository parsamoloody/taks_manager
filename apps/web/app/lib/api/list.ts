// app/lib/api/list.ts
import type { CreateListDto, UpdateListDto } from "@repo/shared";
import { requestJson } from "./client";

export interface List extends CreateListDto {
  id: string;
  boardId: string;
  createdAt: string;
  updatedAt: string;
}

export function getLists(token: string, boardId: string) {
  return requestJson<List[]>(`list/${boardId}`, { method: "GET", token });
}

export function createList(token: string, boardId: string, payload: CreateListDto) {
  return requestJson<List>(`list/${boardId}`, { method: "POST", json: payload, token });
}

export function updateList(token: string, boardId: string, listId: string, payload: UpdateListDto) {
  return requestJson<List>(`list/${boardId}/${listId}`, { method: "PUT", json: payload, token });
}

export function deleteList(token: string, boardId: string, listId: string) {
  return requestJson<void>(`list/${boardId}/${listId}`, { method: "DELETE", token });
}