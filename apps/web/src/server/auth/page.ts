import type { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import type { UserDto } from "@repo/shared";
import { isUnauthorizedError } from "~/server/api/client";
import { clearAccessToken, getAccessToken } from "~/server/auth/session";
import { setPrivateNoStore } from "~/server/http/handlers";

type ProtectedPageData = Record<string, unknown> & { user: UserDto };

function loginRedirect(): GetServerSidePropsResult<never> {
  return {
    redirect: {
      destination: "/login",
      permanent: false,
    },
  };
}

export async function loadProtectedPage<T extends ProtectedPageData>(
  context: GetServerSidePropsContext,
  loader: (token: string) => Promise<T | null>,
): Promise<GetServerSidePropsResult<T>> {
  setPrivateNoStore(context.res);

  const token = getAccessToken(context.req);
  if (!token) return loginRedirect();

  try {
    const data = await loader(token);
    return data ? { props: data } : { notFound: true };
  } catch (error) {
    if (isUnauthorizedError(error)) {
      clearAccessToken(context.res);
      return loginRedirect();
    }

    throw error;
  }
}
