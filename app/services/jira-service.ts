/**
 * Jira service layer.
 *
 * Provides app-level access to projects and issues via the Jira API.
 */

import * as jiraApi from "~/api/jira-api";
import type { Issue, Project } from "~/api/jira-api";

/**
 * Returns the projects that are accessible to users.
 */
export function getAccessibleProjects(): Project[] {
  return jiraApi.getProjects().filter((project) => project.accessible);
}

/**
 * Returns the list of issues for a given project.
 */
export function getIssuesByProject(projectKey: string): Issue[] {
  return jiraApi.searchIssues(`project = "${projectKey}"`);
}
