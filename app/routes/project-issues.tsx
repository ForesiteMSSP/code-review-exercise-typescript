import { useLoaderData, data, Link, Form } from "react-router";
import type { Route } from "./+types/project-issues";
import { getAccessibleProjects, searchIssues } from "~/services/jira-service";

export function loader({ params, request }: Route.LoaderArgs) {
  const projectKey = params.projectKey;
  const url = new URL(request.url);
  const search = url.searchParams.get("search");

  if (!getAccessibleProjects().some((project) => project.key === projectKey)) {
    throw data("Project not found", { status: 404 });
  }

  const issues = searchIssues(projectKey, search || "");

  return { issues, projectKey, search };
}

const priorityColors: Record<string, string> = {
  High: "text-red-600 bg-red-50",
  Medium: "text-yellow-700 bg-yellow-50",
  Low: "text-green-700 bg-green-50",
};

const statusColors: Record<string, string> = {
  "To Do": "text-gray-600 bg-gray-100",
  "In Progress": "text-blue-700 bg-blue-50",
  Done: "text-green-700 bg-green-50",
};

export default function ProjectIssues() {
  const { issues, projectKey, search } = useLoaderData<typeof loader>();

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-700">
          {projectKey} Issues
        </h2>
        <Form method="get" className="flex items-center gap-2">
          <input
            key={search ?? ""}
            type="text"
            name="search"
            placeholder="Search issues..."
            defaultValue={search ?? ""}
            className="border border-gray-300 rounded px-3 py-1.5 text-sm bg-white w-64"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700"
          >
            Search
          </button>
          {search && (
            <Link
              to={`/projects/${projectKey}/issues`}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear
            </Link>
          )}
        </Form>
      </div>
      {search && (
        <p className="text-sm text-gray-500 mb-3">
          Showing results for &ldquo;{search}&rdquo;
        </p>
      )}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">
                ID
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">
                Summary
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">
                Status
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">
                Priority
              </th>
            </tr>
          </thead>
          <tbody>
            {issues.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-8 text-center text-sm text-gray-500"
                >
                  No issues found.
                </td>
              </tr>
            ) : (
              issues.map((issue) => (
                <tr
                  key={issue.id}
                  className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3 text-sm font-mono">
                    <Link
                      to={`/issues/${issue.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {issue.id}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-800">
                    {issue.summary}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${statusColors[issue.status]}`}
                    >
                      {issue.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${priorityColors[issue.priority]}`}
                    >
                      {issue.priority}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
