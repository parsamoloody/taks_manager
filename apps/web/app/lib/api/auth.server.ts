import { redirect } from "react-router";
import { getSession } from "./session.server";

export async function getAccessToken(request: Request) {
  const session = await getSession(request);
  return session.get("accessToken") as string | undefined;
}

export async function requireAccessToken(request: Request) {
  const token = await getAccessToken(request);
  if (!token) throw redirect("/login");
  return token;
}

export async function getAccessTokenOrFail(request: Request) {
  const token = await getAccessToken(request);
  if (!token) {
    throw new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  return token;
}