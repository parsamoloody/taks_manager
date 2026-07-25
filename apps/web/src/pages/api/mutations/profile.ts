import { withAuthMutation } from "~/server/http/handlers";
import { mutateProfile } from "~/server/mutations/profile";

export default withAuthMutation(({ token, fields }) =>
  mutateProfile(token, fields),
);
