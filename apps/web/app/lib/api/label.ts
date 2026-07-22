import type { CreateLabelDto, LabelDto, UpdateLabelDto } from "@repo/shared";
import { requestJson } from "./client";

export function getLabels(token: string, boardId: string) {
  return requestJson<LabelDto[]>(`label/${boardId}`, { token });
}

export function createLabel(token: string, boardId: string, payload: CreateLabelDto) {
  return requestJson<LabelDto>(`label/${boardId}`, { method: "POST", token, json: payload });
}

export function updateLabel(token: string, boardId: string, labelId: string, payload: UpdateLabelDto) {
  return requestJson<LabelDto>(`label/${boardId}/${labelId}`, { method: "PATCH", token, json: payload });
}

export function deleteLabel(token: string, boardId: string, labelId: string) {
  return requestJson<void>(`label/${boardId}/${labelId}`, { method: "DELETE", token });
}
