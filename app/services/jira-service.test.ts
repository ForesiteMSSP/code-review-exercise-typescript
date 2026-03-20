import { describe, it, expect } from "vitest";
import {
  getAccessibleProjects,
  getIssuesByProject,
} from "~/services/jira-service";

describe("getAccessibleProjects", () => {
  it("returns all accessible projects", () => {
    const projects = getAccessibleProjects();
    expect(projects).toHaveLength(2);
    expect(projects[0]).toEqual({
      key: "ALPHA",
      name: "Project Alpha",
      accessible: true,
    });
    expect(projects[1]).toEqual({
      key: "BETA",
      name: "Project Beta",
      accessible: true,
    });
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

  it("returns empty list for an unknown project", () => {
    const issues = getIssuesByProject("UNKNOWN");
    expect(issues).toStrictEqual([]);
  });
});
