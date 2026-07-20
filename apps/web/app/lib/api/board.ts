// app/lib/api/board.ts
import type { CreateBoardDto } from "@repo/shared";
import { requestJson } from "./client";

export interface Board {
    id: string;
    workspaceId: string;
    name: string;
    order: number;
    createdAt: string;
    updatedAt: string;
    members: {
        userId: string;
        joinedAt: string;
        boardId: string;
        user: MemberUser;
    }[];
}

export interface MemberUser {
    id: string;
    firstName: string | null;
    lastName: string | null;
    avatar: string | null;
    email?: string;
}

export function getBoards(token: string, workspaceId: string) {
    return requestJson<Board[]>(`board/${workspaceId}`, { method: "GET", token });
}

export function createBoard(token: string, workspaceId: string, payload: CreateBoardDto) {
    return requestJson<Board>(`board/${workspaceId}`, { method: "POST", json: payload, token });
}

export function updateBoard(token: string, workspaceId: string, boardId: string, payload: CreateBoardDto) {
    return requestJson<Board>(`board/${workspaceId}/${boardId}`, { method: "PUT", json: payload, token });
}

export function deleteBoard(token: string, workspaceId: string, boardId: string) {
    return requestJson<void>(`board/${workspaceId}/${boardId}`, { method: "DELETE", token });
}
