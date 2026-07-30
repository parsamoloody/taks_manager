import { requestPasswordReset } from "~/server/api/auth";
import { getErrorMessage } from "~/server/api/client";
import { fieldTrimmedString } from "~/server/http/form";
import { withMutation } from "~/server/http/handlers";

export default withMutation(async ({ fields }) => {
  const email = fieldTrimmedString(fields, "email").toLowerCase();

  if (!email) {
    return {
      ok: false,
      message: "Enter the email address associated with your account.",
    };
  }

  try {
    await requestPasswordReset(email);
    return {
      ok: true,
      redirectTo: "/forgot-password?sent=success",
    };
  } catch (error) {
    return { ok: false, message: getErrorMessage(error) };
  }
});
