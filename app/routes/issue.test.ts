import { describe, it, expect } from "vitest";
import { loader } from "./issue";
import type { Route } from "./+types/issue";

function loaderArgs(issueId: string): Route.LoaderArgs {
  return { params: { issueId } } as Route.LoaderArgs;
}

describe("issue loader", () => {
  it("returns an issue from an accessible project", () => {
    const result = loader(loaderArgs("ALPHA-1"));
    expect(result).toEqual({
      issue: expect.objectContaining({ id: "ALPHA-1" }),
    });
  });

  it("throws 404 for a non-existent issue", () => {
    expect(() => loader(loaderArgs("NOPE-999"))).toThrow();
  });

  it("should not return an issue from an inaccessible project", () => {
    expect(() => loader(loaderArgs("SECRET-1"))).toThrow();
  });
});
