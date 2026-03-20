import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("./routes/home.tsx"),
  route("projects/:projectKey/issues", "./routes/project-issues.tsx"),
  route("issues/:issueId", "./routes/issue-detail.tsx"),
  route("*", "./routes/catch-all.tsx"),
] satisfies RouteConfig;
