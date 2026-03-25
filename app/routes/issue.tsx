import { useLoaderData, data, Link } from "react-router";
import { getIssueById } from "~/services/jira-service";

import type { Route } from "./+types/issue";

export function loader({ params }: Route.LoaderArgs) {
  const issue = getIssueById(params.issueId);

  if (!issue) {
    throw data("Issue not found", { status: 404 });
  }

  return { issue };
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

export default function IssueDetail() {
  const { issue } = useLoaderData<typeof loader>();

  return (
    <div>
      <Link
        to=".."
        className="text-sm text-blue-600 hover:underline mb-4 inline-block"
      >
        &larr; Back to issues
      </Link>
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-sm font-mono text-gray-500">{issue.id}</span>
          <span
            className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${statusColors[issue.status]}`}
          >
            {issue.status}
          </span>
          <span
            className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${priorityColors[issue.priority]}`}
          >
            {issue.priority}
          </span>
        </div>
        <h2 className="text-xl font-semibold text-gray-800">{issue.summary}</h2>
      </div>
    </div>
  );
}
