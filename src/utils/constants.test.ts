import { describe, it, expect } from "bun:test";
import { DEFAULT_REPO } from "./constants";

describe("constants", () => {
  it("should have correct default repository", () => {
    expect(DEFAULT_REPO).toBe("stevedylandev/bhvr");
  });

  it("should be a string", () => {
    expect(typeof DEFAULT_REPO).toBe("string");
  });

  it("should follow GitHub repo format", () => {
    expect(DEFAULT_REPO).toMatch(/^[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+$/);
  });
});