// app/lib/api/workspace.ts
import type { CreateOrUpdateWorkspaceDto } from "@repo/shared";
import { requestJson } from "./client";
import type { MemberUser } from "./board";
import type { AddWorkspaceMemberDto } from "@repo/shared";

export interface WorkspaceMember {
  workspaceId: string;
  userId: string;
  role: "OWNER" | "ADMIN" | "MEMBER" | string;
  joinedAt: string;
  user: MemberUser;
}

export interface Workspace {
  id: string;
  name: string;
  logo: string | null;
  createdAt: string;
  updatedAt: string;
  members: WorkspaceMember[];
}

export function getWorkspaces(token: string) {
  return requestJson<Workspace[]>("workspace", { method: "GET", token });
}

export function createWorkspace(token: string, payload: CreateOrUpdateWorkspaceDto) {
  return requestJson<Workspace>("workspace", { method: "POST", json: payload, token });
}

export function updateWorkspace(token: string, id: string, payload: CreateOrUpdateWorkspaceDto) {
  return requestJson<Workspace>(`workspace/${id}`, { method: "PUT", json: payload, token });
}

export function deleteWorkspace(token: string, id: string) {
  return requestJson<void>(`workspace/${id}`, { method: "DELETE", token });
}

export function addWorkspaceMember(
  token: string,
  workspaceId: string,
  payload: AddWorkspaceMemberDto,
) {
  return requestJson<WorkspaceMember>(`workspaces/${workspaceId}/members`, {
    method: "POST",
    json: payload,
    token,
  });
}

export function removeWorkspaceMember(token: string, workspaceId: string, userId: string) {
  return requestJson<void>(`workspaces/${workspaceId}/members/${userId}`, {
    method: "DELETE",
    token,
  });
}
