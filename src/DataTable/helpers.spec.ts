import { describe, expect, it } from "vitest"

import { isFilterSet } from "./helpers"

describe("isFilterSet", () => {
  it("returns false for null and undefined", () => {
    expect(isFilterSet(null as any)).toBe(false)
    expect(isFilterSet(undefined as any)).toBe(false)
  })

  it("returns true for a non-empty string and false for empty or whitespace", () => {
    expect(isFilterSet("node-1")).toBe(true)
    expect(isFilterSet("")).toBe(false)
    expect(isFilterSet("   ")).toBe(false)
  })

  it("returns true for a non-empty array and false for an empty array", () => {
    expect(isFilterSet(["Ready"])).toBe(true)
    expect(isFilterSet([])).toBe(false)
  })

  it("returns true when name is set", () => {
    expect(isFilterSet({ name: "node-1", status: [] })).toBe(true)
  })

  it("returns false when name is only whitespace", () => {
    expect(isFilterSet({ name: "   ", status: [] })).toBe(false)
  })

  it("returns true when status has selected values", () => {
    expect(isFilterSet({ name: "", status: [{ label: "Ready", value: "Ready" }] })).toBe(true)
  })

  it("returns true when a label key has selected values", () => {
    expect(isFilterSet({ name: "", status: [], labels: { env: ["prod"] } } as any)).toBe(true)
  })

  it("returns true when labels is a non-empty array", () => {
    expect(isFilterSet({ name: "", status: [], labels: ["env=prod"] } as any)).toBe(true)
  })

  it("returns false when labels keys only have empty value arrays", () => {
    expect(isFilterSet({ name: "", status: [], labels: { env: [] } } as any)).toBe(false)
  })

  it("returns false when name, status, and labels are all empty", () => {
    expect(isFilterSet({ name: "", status: [] })).toBe(false)
    expect(isFilterSet({ name: "", status: [], labels: {} } as any)).toBe(false)
    expect(isFilterSet({ name: "", status: [], labels: [] } as any)).toBe(false)
    expect(isFilterSet({ name: "", status: [], labels: undefined } as any)).toBe(false)
  })

  it("returns true for scalar and unknown object values", () => {
    expect(isFilterSet(1)).toBe(true)
    expect(isFilterSet(true)).toBe(true)
    expect(isFilterSet({ other: "field" } as any)).toBe(true)
  })
})
