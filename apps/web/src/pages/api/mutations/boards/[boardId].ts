import { withAuthMutation } from "~/server/http/handlers";
import { mutateBoard } from "~/server/mutations/board";

export default withAuthMutation(({ req, token, fields }) => {
  const value = req.query.boardId;
  const boardId = Array.isArray(value) ? value[0] : value;

  if (!boardId) {
    return { ok: false, message: "Board id is required." };
  }

  return mutateBoard(token, boardId, fields);
});
