import { withAuthMutation } from "~/server/http/handlers";
import { mutateWorkspace } from "~/server/mutations/workspace";

export default withAuthMutation(({ req, token, fields }) => {
  const value = req.query.workspaceId;
  const workspaceId = Array.isArray(value) ? value[0] : value;

  if (!workspaceId) {
    return { ok: false, message: "Workspace id is required." };
  }

  return mutateWorkspace(token, workspaceId, fields);
});
