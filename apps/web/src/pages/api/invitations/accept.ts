import { getErrorMessage } from "~/server/api/client";
import { acceptWorkspaceInvitation } from "~/server/api/workspace";
import { fieldTrimmedString } from "~/server/http/form";
import { withAuthMutation } from "~/server/http/handlers";

export default withAuthMutation(async ({ fields, token }) => {
  const inviteToken = fieldTrimmedString(fields, "token");

  if (!inviteToken) {
    return { ok: false, message: "This invitation link is invalid." };
  }

  try {
    await acceptWorkspaceInvitation(token, inviteToken);
    return {
      ok: true,
      message: "Invitation accepted.",
      redirectTo: "/workspaces",
    };
  } catch (error) {
    return { ok: false, message: getErrorMessage(error) };
  }
});
