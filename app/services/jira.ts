/**
 * Jira service layer.
 *
 * Provides access to projects and issues backed by static JSON data.
 * Only projects listed in `accessible-projects.json` are considered
 * user-facing; the full issue set (across all projects) is maintained
 * internally for query purposes.
 */

import accessibleProjects from "~/data/accessible-projects.json";
import alphaIssues from "~/data/issues-alpha.json";
import betaIssues from "~/data/issues-beta.json";
import secretIssues from "~/data/issues-secret.json";
import { executeJql } from "./jql";

export interface Project {
  key: string;
  name: string;
}

export interface Issue {
  id: string;
  summary: string;
  status: "To Do" | "In Progress" | "Done";
  priority: "High" | "Medium" | "Low";
}

const issuesByProject: Record<string, Issue[]> = {
  ALPHA: alphaIssues as Issue[],
  BETA: betaIssues as Issue[],
  SECRET: secretIssues as Issue[],
};

const allIssues: (Issue & { project: string })[] = Object.entries(
  issuesByProject,
).flatMap(([project, issues]) =>
  issues.map((issue) => ({ ...issue, project })),
);

/**
 * Returns the projects that are accessible to users.
 * Projects not listed in `accessible-projects.json` are excluded.
 * @returns {Project[]} The list of accessible projects.
 */
export function getAccessibleProjects(): Project[] {
  return accessibleProjects;
}

/**
 * Returns the list of issues for a given project.
 * Only returns issues for projects that are in the accessible projects list.
 * @param {string} projectKey - The unique key identifying the project (e.g. "ALPHA").
 * @returns {Issue[] | null} The list of issues, or `null` if the project is not accessible.
 */
export function getIssuesByProject(projectKey: string): Issue[] | null {
  const isValidProject = accessibleProjects.some((p) => p.key === projectKey);
  if (!isValidProject) {
    return null;
  }
  const issues = issuesByProject[projectKey];
  return issues ?? null;
}

/**
 * Searches for issues within a project using a text query.
 * Constructs a JQL query scoped to the given project and filters by summary text.
 * @param {string} projectKey - The project to search within.
 * @param {string} searchText - The text to search for in issue summaries.
 * @returns {Issue[]} The matching issues.
 */
export function searchIssues(projectKey: string, searchText: string): Issue[] {
  const jql = `project = "${projectKey}" AND summary ~ "${searchText}"`;
  return executeJql(jql, allIssues);
}

export function getIssueById(issueId: string): Issue | null {
  return allIssues.find((issue) => issue.id === issueId) ?? null;
}
