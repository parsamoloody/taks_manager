import type { UpdateUserDto } from "@repo/shared";
import { getErrorMessage, isUnauthorizedError } from "~/server/api/client";
import { updateCurrentUser } from "~/server/api/user";
import {
  fieldString,
  fieldTrimmedString,
  type RequestFields,
} from "~/server/http/form";
import type { MutationResult } from "~/server/http/handlers";

export async function mutateProfile(
  token: string,
  fields: RequestFields,
): Promise<MutationResult> {
  const password = fieldString(fields, "password");
  const avatar = fieldTrimmedString(fields, "avatar");
  const payload: UpdateUserDto = {
    firstName: fieldTrimmedString(fields, "firstName"),
    lastName: fieldTrimmedString(fields, "lastName"),
    email: fieldTrimmedString(fields, "email"),
    avatar: avatar || undefined,
    ...(password ? { password } : {}),
  };

  try {
    await updateCurrentUser(token, payload);
    return { ok: true, message: "Profile updated successfully." };
  } catch (error) {
    if (isUnauthorizedError(error)) throw error;
    return { ok: false, message: getErrorMessage(error) };
  }
}
