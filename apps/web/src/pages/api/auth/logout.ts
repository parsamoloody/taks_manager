import { clearAccessToken } from "~/server/auth/session";
import { withMutation } from "~/server/http/handlers";

export default withMutation(({ res }) => {
  clearAccessToken(res);
  return { ok: true, redirectTo: "/login" };
});
