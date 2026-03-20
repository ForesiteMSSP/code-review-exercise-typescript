import { describe, it, expect } from "vitest";
import { executeJql } from "./jql";
import type { Issue } from "./jira";

const issues: (Issue & { project: string })[] = [
  { id: "FOO-1", summary: "Fix login bug", status: "In Progress", priority: "High", project: "FOO" },
  { id: "FOO-2", summary: "Add search feature", status: "To Do", priority: "Medium", project: "FOO" },
  { id: "FOO-3", summary: "Update documentation", status: "Done", priority: "Low", project: "FOO" },
  { id: "BAR-1", summary: "Fix payment bug", status: "To Do", priority: "High", project: "BAR" },
  { id: "BAR-2", summary: "Design new landing page", status: "In Progress", priority: "Medium", project: "BAR" },
];

describe("executeJql", () => {
  describe("equality operator (=)", () => {
    it("filters by project", () => {
      const result = executeJql('project = "FOO"', issues);
      expect(result).toHaveLength(3);
      expect(result.every((i) => i.id.startsWith("FOO"))).toBe(true);
    });

    it("filters by priority", () => {
      const result = executeJql('priority = "High"', issues);
      expect(result).toHaveLength(2);
      expect(result.every((i) => i.priority === "High")).toBe(true);
    });

    it("filters by status", () => {
      const result = executeJql('status = "To Do"', issues);
      expect(result).toHaveLength(2);
      expect(result.every((i) => i.status === "To Do")).toBe(true);
    });

    it("is case-insensitive for values", () => {
      const result = executeJql('priority = "high"', issues);
      expect(result).toHaveLength(2);
    });
  });

  describe("contains operator (~)", () => {
    it("filters by substring match on summary", () => {
      const result = executeJql('summary ~ "bug"', issues);
      expect(result).toHaveLength(2);
      expect(result.map((i) => i.id)).toEqual(["FOO-1", "BAR-1"]);
    });

    it("is case-insensitive", () => {
      const result = executeJql('summary ~ "Bug"', issues);
      expect(result).toHaveLength(2);
    });

    it("returns empty array when no match", () => {
      const result = executeJql('summary ~ "nonexistent"', issues);
      expect(result).toHaveLength(0);
    });
  });

  describe("AND operator", () => {
    it("combines two conditions", () => {
      const result = executeJql('project = "FOO" AND priority = "High"', issues);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("FOO-1");
    });

    it("chains multiple AND conditions", () => {
      const result = executeJql('project = "FOO" AND priority = "High" AND summary ~ "login"', issues);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("FOO-1");
    });
  });

  describe("OR operator", () => {
    it("matches either condition", () => {
      const result = executeJql('project = "FOO" OR project = "BAR"', issues);
      expect(result).toHaveLength(5);
    });

    it("returns results from both sides", () => {
      const result = executeJql('priority = "High" OR priority = "Low"', issues);
      expect(result).toHaveLength(3);
    });
  });

  describe("operator precedence", () => {
    it("AND binds tighter than OR", () => {
      // Should be: (project = "FOO" AND priority = "High") OR (project = "BAR")
      const result = executeJql('project = "FOO" AND priority = "High" OR project = "BAR"', issues);
      expect(result).toHaveLength(3);
      expect(result.map((i) => i.id)).toEqual(["FOO-1", "BAR-1", "BAR-2"]);
    });
  });

  describe("edge cases", () => {
    it("returns all issues for empty query", () => {
      const result = executeJql("", issues);
      expect(result).toHaveLength(5);
    });

    it("handles values with spaces", () => {
      const result = executeJql('status = "In Progress"', issues);
      expect(result).toHaveLength(2);
    });

    it("handles unterminated string gracefully", () => {
      const result = executeJql('summary ~ "bug', issues);
      expect(result).toHaveLength(2);
    });

    it("throws on malformed query", () => {
      expect(() => executeJql("summary", issues)).toThrow();
    });

    it("derives project from issue ID if project field is missing", () => {
      const issuesWithoutProject: Issue[] = [
        { id: "FOO-1", summary: "Test", status: "To Do", priority: "High" },
      ];
      const result = executeJql('project = "FOO"', issuesWithoutProject);
      expect(result).toHaveLength(1);
    });
  });
});
