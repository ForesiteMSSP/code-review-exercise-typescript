import { describe, it, expect } from "vitest";
import {
  getAccessibleProjects,
  getIssuesByProject,
  searchIssues,
  getIssueById,
} from "./jira";

describe("getAccessibleProjects", () => {
  it("returns all accessible projects", () => {
    const projects = getAccessibleProjects();
    expect(projects).toHaveLength(2);
    expect(projects[0]).toEqual({ key: "ALPHA", name: "Project Alpha" });
    expect(projects[1]).toEqual({ key: "BETA", name: "Project Beta" });
  });
});

describe("getIssuesByProject", () => {
  it("returns issues for ALPHA project", () => {
    const issues = getIssuesByProject("ALPHA");
    expect(issues).not.toBeNull();
    expect(issues).toHaveLength(7);
    expect(issues![0].id).toBe("ALPHA-1");
  });

  it("returns issues for BETA project", () => {
    const issues = getIssuesByProject("BETA");
    expect(issues).not.toBeNull();
    expect(issues).toHaveLength(6);
    expect(issues![0].id).toBe("BETA-1");
  });

  it("returns issues with the correct shape", () => {
    const issues = getIssuesByProject("ALPHA");
    const issue = issues![0];
    expect(issue).toHaveProperty("id");
    expect(issue).toHaveProperty("summary");
    expect(issue).toHaveProperty("status");
    expect(issue).toHaveProperty("priority");
  });

  it("returns null for an unknown project", () => {
    const issues = getIssuesByProject("UNKNOWN");
    expect(issues).toBeNull();
  });
});

describe("searchIssues", () => {
  it("returns matching issues for a project", () => {
    const results = searchIssues("ALPHA", "CI/CD");
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe("ALPHA-1");
  });

  it("returns empty array when no issues match", () => {
    const results = searchIssues("ALPHA", "nonexistent query");
    expect(results).toHaveLength(0);
  });

  it("scopes search to the given project", () => {
    const results = searchIssues("ALPHA", "design");
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe("ALPHA-2");
  });

  it("is case-insensitive", () => {
    const results = searchIssues("ALPHA", "ci/cd");
    expect(results).toHaveLength(1);
  });

  it("does not return results for inaccessible projects", () => {
    const results = searchIssues("SECRET", "a");
    expect(results).toHaveLength(0);
  });
});

describe("getIssueById", () => {
  it("returns the issue when it exists", () => {
    const issue = getIssueById("ALPHA-1");
    expect(issue).not.toBeNull();
    expect(issue!.id).toBe("ALPHA-1");
    expect(issue!.summary).toBe("Set up CI/CD pipeline");
  });

  it("returns null for a non-existent issue", () => {
    const issue = getIssueById("NOPE-999");
    expect(issue).toBeNull();
  });

  it("returns issues from different projects", () => {
    const alpha = getIssueById("ALPHA-1");
    const beta = getIssueById("BETA-1");
    expect(alpha).not.toBeNull();
    expect(beta).not.toBeNull();
  });
});
