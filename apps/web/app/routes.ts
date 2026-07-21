import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/login", "routes/auth/login.tsx"),
  route("/signup", "routes/auth/signup.tsx"),
  route("/profile", "routes/profile.tsx"),
  route("/workspaces", "routes/workspace/workspace.tsx"),
  route("workspaces/:workspaceId", "routes/workspace/workspace.$workspaceId.tsx"),
  route("workspaces/:workspaceId/board/:boardId", "routes/board/board.$boardId.tsx"),
] satisfies RouteConfig;
