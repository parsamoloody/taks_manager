import type { AddBoardMemberDto } from "@repo/shared";
import type { Board } from "./board";
import { requestJson } from "./client";

export type BoardMember = Board["members"][number];

export function getBoardMembers(token: string, boardId: string) {
  return requestJson<BoardMember[]>(`board-member/${boardId}`, { token });
}

export function addBoardMember(
  token: string,
  boardId: string,
  payload: AddBoardMemberDto,
) {
  return requestJson<BoardMember>(`board-member/${boardId}`, {
    method: "POST",
    token,
    json: payload,
  });
}

export function inviteBoardMember(
  token: string,
  boardId: string,
  email: string,
) {
  return requestJson<{ message: string; expiresAt: string }>(
    `boards/${boardId}/invitations`,
    {
      method: "POST",
      token,
      json: { email },
    },
  );
}

export function removeBoardMember(
  token: string,
  boardId: string,
  userId: string,
) {
  return requestJson<void>(`board-member/${boardId}/${userId}`, {
    method: "DELETE",
    token,
  });
}
