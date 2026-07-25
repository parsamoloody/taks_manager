import type { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import type { UserDto } from "@repo/shared";
import { isUnauthorizedError } from "~/server/api/client";
import { getCurrentUser } from "~/server/api/user";
import {
  clearAccessToken,
  getAccessToken,
  sessionCookieName,
} from "~/server/auth/session";
import { setPrivateNoStore } from "~/server/http/handlers";

export interface LandingPageProps {
  user: UserDto | null;
}

export async function loadLandingPage(
  context: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<LandingPageProps>> {
  setPrivateNoStore(context.res);
  const token = getAccessToken(context.req);

  if (!token) {
    if (context.req.cookies[sessionCookieName]) {
      clearAccessToken(context.res);
    }
    return { props: { user: null } };
  }

  try {
    return {
      props: {
        user: await getCurrentUser(token),
      },
    };
  } catch (error) {
    if (isUnauthorizedError(error)) {
      clearAccessToken(context.res);
      return { props: { user: null } };
    }

    throw error;
  }
}
