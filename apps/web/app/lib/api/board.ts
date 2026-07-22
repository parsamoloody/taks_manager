// app/lib/api/board.ts
import type { CreateBoardDto, LabelDto, UpdateBoardDto } from "@repo/shared";
import { requestJson } from "./client";

export interface Board {
    id: string;
    workspaceId: string;
    name: string;
    description: string | null;
    createdAt: string;
    updatedAt: string;
    visibility: 'PRIVATE' | 'WORKSPACE'
    labels?: LabelDto[];
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

export function getBoard(token: string, workspaceId: string, boardId: string) {
    return requestJson<Board>(`board/${workspaceId}/${boardId}`, { method: "GET", token });
}

export function createBoard(token: string, workspaceId: string, payload: CreateBoardDto) {
    return requestJson<Board>(`board/${workspaceId}`, { method: "POST", json: payload, token });
}

export function updateBoard(token: string, boardId: string, payload: UpdateBoardDto) {
    return requestJson<Board>(`board/${boardId}`, { method: "PUT", json: payload, token });
}

export function deleteBoard(token: string, boardId: string) {
    return requestJson<void>(`board/${boardId}`, { method: "DELETE", token });
}
