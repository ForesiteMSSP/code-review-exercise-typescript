import { describe, it, expect } from "vitest";
import { getProjects, searchIssues, getIssue } from "~/api/jira-api";

describe("getProjects", () => {
  it("returns all projects", () => {
    const projects = getProjects();
    expect(projects).toHaveLength(3);
    expect(projects.map((p) => p.key)).toEqual(["ALPHA", "BETA", "SECRET"]);
  });

  it("returns projects with all properties", () => {
    const project = getProjects()[0];
    expect(project).toEqual({
      key: "ALPHA",
      name: "Project Alpha",
      accessible: true,
    });
  });
});

describe("searchIssues", () => {
  it("returns all issues when no query is provided", () => {
    const issues = searchIssues("");
    expect(issues.length).toBeGreaterThan(0);
    const prefixes = new Set(issues.map((i) => i.id.split("-")[0]));
    expect(prefixes).toContain("ALPHA");
    expect(prefixes).toContain("BETA");
    expect(prefixes).toContain("SECRET");
  });

  it("filters by project using JQL", () => {
    const issues = searchIssues('project = "ALPHA"');
    expect(issues).toHaveLength(7);
    expect(issues.every((i) => i.id.startsWith("ALPHA-"))).toBe(true);
  });

  it("filters by priority using JQL", () => {
    const issues = searchIssues('priority = "High"');
    expect(issues.length).toBeGreaterThan(0);
    expect(issues.every((i) => i.priority === "High")).toBe(true);
  });

  it("filters by status using JQL", () => {
    const issues = searchIssues('status = "Done"');
    expect(issues.length).toBeGreaterThan(0);
    expect(issues.every((i) => i.status === "Done")).toBe(true);
  });

  it("supports compound JQL with AND", () => {
    const issues = searchIssues('project = "ALPHA" AND priority = "High"');
    expect(issues.length).toBeGreaterThan(0);
    expect(
      issues.every((i) => i.id.startsWith("ALPHA-") && i.priority === "High"),
    ).toBe(true);
  });

  it("supports substring match with ~", () => {
    const issues = searchIssues('summary ~ "CI/CD"');
    expect(issues).toHaveLength(1);
    expect(issues[0].id).toBe("ALPHA-1");
  });

  it("returns an empty array when no issues match", () => {
    const issues = searchIssues('project = "NONEXISTENT"');
    expect(issues).toEqual([]);
  });
});

describe("getIssue", () => {
  it("returns an issue by ID", () => {
    const issue = getIssue("ALPHA-1");
    expect(issue).not.toBeNull();
    expect(issue!.id).toBe("ALPHA-1");
    expect(issue!.summary).toBe("Set up CI/CD pipeline");
  });

  it("returns an issue from a different project", () => {
    const issue = getIssue("BETA-3");
    expect(issue).not.toBeNull();
    expect(issue!.id).toBe("BETA-3");
    expect(issue!.summary).toBe("Build component library");
  });

  it("returns the full issue shape", () => {
    const issue = getIssue("ALPHA-1");
    expect(issue).toHaveProperty("id");
    expect(issue).toHaveProperty("summary");
    expect(issue).toHaveProperty("status");
    expect(issue).toHaveProperty("priority");
  });

  it("returns null for a nonexistent issue ID", () => {
    const issue = getIssue("NOPE-999");
    expect(issue).toBeNull();
  });
});
