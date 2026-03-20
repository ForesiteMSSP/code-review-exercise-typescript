/**
 * Simple JQL (Jira Query Language) parser and evaluator.
 *
 * Supports a subset of JQL syntax for filtering issues in-memory:
 *
 *   Operators:
 *     =   Exact match (case-insensitive)
 *     ~   Contains / substring match (case-insensitive)
 *
 *   Logical operators:
 *     AND   Both conditions must match (binds tighter than OR)
 *     OR    Either condition must match
 *
 *   Supported fields: project, summary, status, priority
 *
 *   Examples:
 *     project = "ALPHA"
 *     summary ~ "login"
 *     project = "ALPHA" AND priority = "High"
 *     priority = "High" OR priority = "Medium"
 *     project = "ALPHA" AND priority = "High" OR project = "BETA"
 *
 * Values must be quoted with double quotes. Unterminated quotes are
 * handled gracefully (the remainder of the input is treated as the value).
 *
 * If an issue does not have an explicit `project` field, the project key
 * is derived from the issue ID prefix (e.g. "ALPHA-1" → "ALPHA").
 */

import type { Issue } from "./jira";

/** A single field comparison (e.g. `summary ~ "bug"`). */
interface Condition {
  field: string;
  operator: "=" | "~";
  value: string;
}

/** A parsed JQL expression tree node. */
type Expression =
  | { type: "condition"; condition: Condition }
  | { type: "and"; left: Expression; right: Expression }
  | { type: "or"; left: Expression; right: Expression };

/** Splits a JQL string into tokens: quoted strings, operators (= ~), and words. */
function tokenize(jql: string): string[] {
  const tokens: string[] = [];
  let i = 0;

  while (i < jql.length) {
    if (jql[i] === " ") {
      i++;
      continue;
    }

    if (jql[i] === '"') {
      let str = "";
      i++; // skip opening quote
      while (i < jql.length && jql[i] !== '"') {
        str += jql[i];
        i++;
      }
      if (i < jql.length) {
        i++; // skip closing quote
      }
      tokens.push(`"${str}"`);
      continue;
    }

    if (jql[i] === "=" || jql[i] === "~") {
      tokens.push(jql[i]);
      i++;
      continue;
    }

    let word = "";
    while (i < jql.length && jql[i] !== " " && jql[i] !== "=" && jql[i] !== "~" && jql[i] !== '"') {
      word += jql[i];
      i++;
    }
    if (word) {
      tokens.push(word);
    }
  }

  return tokens;
}

/** Strips surrounding quotes from a token, if present. */
function parseValue(token: string): string {
  if (token.startsWith('"') && token.endsWith('"')) {
    return token.slice(1, -1);
  }
  return token;
}

/** Parses a single condition (field operator value) starting at the given token position. */
function parseCondition(tokens: string[], pos: number): { expr: Expression; pos: number } {
  if (pos + 2 >= tokens.length) {
    throw new Error(`Expected condition at position ${pos}, but not enough tokens`);
  }

  const field = tokens[pos].toLowerCase();
  const operator = tokens[pos + 1];
  const value = parseValue(tokens[pos + 2]);

  if (operator !== "=" && operator !== "~") {
    throw new Error(`Unknown operator: ${operator}`);
  }

  return {
    expr: { type: "condition", condition: { field, operator, value } },
    pos: pos + 3,
  };
}

/** Parses a full expression with AND/OR operators. AND binds tighter than OR. */
function parseExpression(tokens: string[], pos: number): { expr: Expression; pos: number } {
  let result = parseCondition(tokens, pos);

  while (result.pos < tokens.length) {
    const next = tokens[result.pos].toUpperCase();

    if (next === "AND") {
      const right = parseCondition(tokens, result.pos + 1);
      result = {
        expr: { type: "and", left: result.expr, right: right.expr },
        pos: right.pos,
      };
    } else if (next === "OR") {
      const right = parseExpression(tokens, result.pos + 1);
      result = {
        expr: { type: "or", left: result.expr, right: right.expr },
        pos: right.pos,
      };
    } else {
      break;
    }
  }

  return result;
}

/** Evaluates a single condition against an issue. */
function evaluateCondition(issue: Issue & { project?: string }, condition: Condition): boolean {
  let fieldValue: string;

  switch (condition.field) {
    case "project":
      fieldValue = issue.project ?? issue.id.split("-")[0];
      break;
    case "summary":
      fieldValue = issue.summary;
      break;
    case "status":
      fieldValue = issue.status;
      break;
    case "priority":
      fieldValue = issue.priority;
      break;
    default:
      return false;
  }

  if (condition.operator === "=") {
    return fieldValue.toUpperCase() === condition.value.toUpperCase();
  }

  if (condition.operator === "~") {
    return fieldValue.toLowerCase().includes(condition.value.toLowerCase());
  }

  return false;
}

/** Recursively evaluates an expression tree against an issue. */
function evaluateExpression(issue: Issue & { project?: string }, expr: Expression): boolean {
  switch (expr.type) {
    case "condition":
      return evaluateCondition(issue, expr.condition);
    case "and":
      return evaluateExpression(issue, expr.left) && evaluateExpression(issue, expr.right);
    case "or":
      return evaluateExpression(issue, expr.left) || evaluateExpression(issue, expr.right);
  }
}

/**
 * Executes a JQL query against a list of issues.
 * Supports: field = "value", field ~ "text", AND, OR operators.
 * AND binds tighter than OR.
 */
export function executeJql(jql: string, issues: (Issue & { project?: string })[]): Issue[] {
  const tokens = tokenize(jql);

  if (tokens.length === 0) {
    return issues;
  }

  const { expr } = parseExpression(tokens, 0);
  return issues.filter((issue) => evaluateExpression(issue, expr));
}
