import type { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { isUnauthorizedError } from "~/server/api/client";
import { getCurrentUser } from "~/server/api/user";
import { clearAccessToken, getAccessToken } from "~/server/auth/session";
import { setPrivateNoStore } from "~/server/http/handlers";

interface GuestPageProps {
  user: null;
}

export async function loadGuestPage(
  context: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<GuestPageProps>> {
  setPrivateNoStore(context.res);
  const token = getAccessToken(context.req);

  if (token) {
    try {
      await getCurrentUser(token);
      return {
        redirect: {
          destination: "/workspaces",
          permanent: false,
        },
      };
    } catch (error) {
      if (isUnauthorizedError(error)) clearAccessToken(context.res);
    }
  }

  return { props: { user: null } };
}
