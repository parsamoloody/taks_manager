import { withAuthMutation } from "~/server/http/handlers";
import { mutateWorkspaces } from "~/server/mutations/workspaces";

export default withAuthMutation(({ token, fields }) =>
  mutateWorkspaces(token, fields),
);
