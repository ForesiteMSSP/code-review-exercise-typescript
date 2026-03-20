import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useLoaderData,
  useNavigate,
  useParams,
} from "react-router";
import type { Route } from "./+types/root";
import { getAccessibleProjects } from "~/services/jira-service";
import "./app.css";

export function loader() {
  return { projects: getAccessibleProjects() };
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Issue Tracker</title>
        <Meta />
        <Links />
      </head>
      <body className="bg-gray-50 text-gray-900">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const { projects } = useLoaderData<typeof loader>();
  const params = useParams();
  const navigate = useNavigate();
  const currentProject = params.projectKey ?? projects[0].key;

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-800">Issue Tracker</h1>
          <div className="flex items-center gap-2">
            <label htmlFor="project-select" className="text-sm text-gray-600">
              Project:
            </label>
            <select
              id="project-select"
              value={currentProject}
              onChange={(e) => navigate(`/projects/${e.target.value}/issues`)}
              className="border border-gray-300 rounded px-3 py-1.5 text-sm bg-white"
            >
              {projects.map((project) => (
                <option key={project.key} value={project.key}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-red-600">{message}</h1>
      <p className="mt-2 text-gray-600">{details}</p>
      <a href="/" className="mt-4 inline-block text-blue-600 hover:underline">
        Go to homepage
      </a>
    </main>
  );
}
