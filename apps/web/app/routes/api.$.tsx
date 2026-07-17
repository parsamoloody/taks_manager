import { getAccessTokenOrFail } from "~/lib/api/auth.server";
import type { Route } from "./+types/api.$";

const API_BASE_URL = process.env.API_URL ?? "http://localhost:4000";

async function forward(request: Request, params: Route.LoaderArgs["params"]) {
  const token = await getAccessTokenOrFail(request);
  const path = params["*"];
  const url = new URL(request.url);
  const targetUrl = `${API_BASE_URL}/${path}${url.search}`;
  const init: RequestInit = {
    method: request.method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };

  if (!["GET", "HEAD"].includes(request.method)) {
    const bodyText = await request.text();
    if (bodyText) init.body = bodyText;
  }

  const res = await fetch(targetUrl, init);
  const text = await res.text();

  return new Response(text || "null", {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function loader({ request, params }: Route.LoaderArgs) {
  return forward(request, params);
}

export async function action({ request, params }: Route.ActionArgs) {
  return forward(request, params);
}