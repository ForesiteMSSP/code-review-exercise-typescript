import { useLoaderData, data } from "react-router";
import {
  getAccessibleProjects,
  getIssuesByProject,
} from "~/services/jira-service";

import type { Route } from "./+types/project-issues";

export function loader({ params }: Route.LoaderArgs) {
  const projectKey = params.projectKey;

  if (!getAccessibleProjects().some((project) => project.key === projectKey)) {
    throw data("Project not found", { status: 404 });
  }

  const issues = getIssuesByProject(projectKey);

  return { issues, projectKey };
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
  const { issues, projectKey } = useLoaderData<typeof loader>();

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-700 mb-4">
        {projectKey} Issues
      </h2>
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
                  <td className="px-4 py-3 text-sm font-mono">{issue.id}</td>
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
