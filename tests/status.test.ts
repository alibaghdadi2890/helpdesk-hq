import { describe, expect, it } from "vitest";
import { assertTransition, canTransition } from "@/domain/status";

describe("ticket status rules", () => {
  it.each([
    ["new", "open"], ["open", "pending"], ["pending", "open"], ["open", "solved"], ["solved", "open"], ["solved", "closed"],
  ] as const)("allows %s → %s", (from, to) => {
    expect(canTransition(from, to)).toBe(true);
  });

  it.each([
    ["new", "closed"], ["open", "closed"], ["closed", "open"], ["pending", "new"],
  ] as const)("refuses %s → %s", (from, to) => {
    expect(canTransition(from, to)).toBe(false);
    expect(() => assertTransition(from, to)).toThrow();
  });

  it("treats a change to the same status as a no-op", () => {
    expect(() => assertTransition("closed", "closed")).not.toThrow();
  });
});
