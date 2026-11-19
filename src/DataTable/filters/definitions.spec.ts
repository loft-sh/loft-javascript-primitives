import { describe, expect, it } from "vitest"

import { ChipFilter, getChipLabel, parseDateRange } from "./definitions"

describe("filter definitions", () => {
  it("accepts only complete, valid and ordered date ranges", () => {
    const from = "2026-10-01T00:00:00.000Z"
    const to = "2026-10-07T00:00:00.000Z"
    expect(parseDateRange([from, to])).toEqual({ from: new Date(from), to: new Date(to) })
    expect(parseDateRange([from, from])).toEqual({ from: new Date(from), to: new Date(from) })
    expect(parseDateRange([from])).toBeUndefined()
    expect(parseDateRange([to, from])).toBeUndefined()
    expect(parseDateRange([from, "not a date"])).toBeUndefined()
    expect(parseDateRange(undefined)).toBeUndefined()
  })

  it("labels a chip with option labels and keeps unknown values", () => {
    const chip: ChipFilter = {
      id: "owner",
      type: "options",
      label: "Owner",
      options: [{ value: "user:ann", label: "Ann", description: "Acme" }],
    }
    expect(getChipLabel(chip, ["user:ann", "user:bob"])).toBe("Ann (Acme), user:bob")
  })
})
