/**
 * Fake Jira API.
 *
 * Simulates a Jira REST API backed by static JSON data.
 * Consumers should treat this as an external API boundary —
 * the underlying data files are an implementation detail.
 */

import alphaIssues from "~/data/issues-alpha.json";
import betaIssues from "~/data/issues-beta.json";
import secretIssues from "~/data/issues-secret.json";
import projects from "~/data/projects.json";
import { executeJql } from "~/api/jql";

export interface Issue {
  id: string;
  summary: string;
  status: "To Do" | "In Progress" | "Done";
  priority: "High" | "Medium" | "Low";
}

export interface Project {
  key: string;
  name: string;
  accessible: boolean;
}

const allProjects: Project[] = projects as Project[];

const issuesByProject: Record<string, Issue[]> = {
  ALPHA: alphaIssues as Issue[],
  BETA: betaIssues as Issue[],
  SECRET: secretIssues as Issue[],
};

const allIssues: Issue[] = Object.values(issuesByProject).flat();

/** Returns all projects known to the Jira instance. */
export function getProjects(): Project[] {
  return allProjects;
}

/**
 * Searches for issues using a JQL query string.
 * Returns all issues when no query is provided.
 * Supports the same JQL syntax as {@link executeJql}.
 */
export function searchIssues(jql: string): Issue[] {
  return executeJql(jql, allIssues);
}

/**
 * Returns a single issue by its ID (e.g. "ALPHA-1").
 * Returns `null` if no issue with the given ID exists.
 */
export function getIssue(issueId: string): Issue | null {
  return allIssues.find((issue) => issue.id === issueId) ?? null;
}
