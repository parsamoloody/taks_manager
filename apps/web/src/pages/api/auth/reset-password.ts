import { resetPassword } from "~/server/api/auth";
import { getErrorMessage } from "~/server/api/client";
import { fieldString, fieldTrimmedString } from "~/server/http/form";
import { withMutation } from "~/server/http/handlers";

export default withMutation(async ({ fields }) => {
  const token = fieldTrimmedString(fields, "token");
  const password = fieldString(fields, "password");
  const confirmPassword = fieldString(fields, "confirmPassword");

  if (!token) {
    return {
      ok: false,
      message: "This password reset link is invalid.",
    };
  }

  if (password.length < 8) {
    return {
      ok: false,
      message: "Your new password must contain at least 8 characters.",
    };
  }

  if (password !== confirmPassword) {
    return {
      ok: false,
      message: "The passwords do not match.",
    };
  }

  try {
    await resetPassword({ token, password });
    return {
      ok: true,
      redirectTo: "/login?passwordReset=success",
    };
  } catch (error) {
    return { ok: false, message: getErrorMessage(error) };
  }
});
