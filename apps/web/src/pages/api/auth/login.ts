import { signIn } from "~/server/api/auth";
import { getErrorMessage } from "~/server/api/client";
import { setAccessToken } from "~/server/auth/session";
import { fieldString, fieldTrimmedString } from "~/server/http/form";
import { withMutation } from "~/server/http/handlers";

export default withMutation(async ({ fields, res }) => {
  const email = fieldTrimmedString(fields, "email");
  const password = fieldString(fields, "password");
  const returnTo = safeReturnTo(fieldString(fields, "returnTo"));

  if (!email || !password) {
    return {
      ok: false,
      message: "Please enter both your email and password.",
    };
  }

  try {
    const result = await signIn({ email, password });
    setAccessToken(res, result.access_token);
    return { ok: true, redirectTo: returnTo ?? "/workspaces" };
  } catch (error) {
    return { ok: false, message: getErrorMessage(error) };
  }
});

function safeReturnTo(value: string) {
  return value.startsWith("/") && !value.startsWith("//") ? value : null;
}
