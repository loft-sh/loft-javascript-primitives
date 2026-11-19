import { act, renderHook } from "@testing-library/react"
import React, { ReactNode } from "react"
import { MemoryRouter, useLocation } from "react-router-dom"
import { describe, expect, it } from "vitest"

import { ChipFilter, FilterDefinitions } from "./definitions"
import { useChipFilterBar } from "./useChipFilterBar"
import { useFilterState } from "./useFilterState"

const filters: FilterDefinitions<{ name: string }> = {
  search: { type: "text" },
  status: { type: "options", label: "Status", options: [{ value: "Ready", label: "Ready" }] },
  owner: { type: "select", label: "Owner", options: [{ value: "ann", label: "Ann" }] },
  team: { type: "options", label: "Team", options: [] },
  time: { type: "dateRange", label: "Time" },
}

function renderChipBar(initialEntry: string) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[initialEntry]}>{children}</MemoryRouter>
  )

  return renderHook(
    () => ({
      chipBar: useChipFilterBar(filters, useFilterState(filters)),
      location: useLocation(),
    }),
    { wrapper }
  )
}

function ids(chips: ChipFilter[]) {
  return chips.map(({ id }) => id)
}

describe("useChipFilterBar", () => {
  it("shows a chip per filter value in URL order and offers the rest", () => {
    const { result } = renderChipBar("/?owner=ann&search=al&status=Ready")
    expect(ids(result.current.chipBar.chips)).toEqual(["owner", "status"])
    expect(ids(result.current.chipBar.addable)).toEqual(["time"])
  })

  it("shows an added chip until it closes without a value", () => {
    const { result } = renderChipBar("/")
    expect(ids(result.current.chipBar.addable)).toEqual(["status", "owner", "time"])
    act(() => result.current.chipBar.add("status"))
    expect(ids(result.current.chipBar.chips)).toEqual(["status"])
    expect(result.current.chipBar.openId).toBe("status")
    expect(ids(result.current.chipBar.addable)).toEqual(["owner", "time"])
    act(() => result.current.chipBar.hide())
    expect(ids(result.current.chipBar.chips)).toEqual(["status"])
    act(() => result.current.chipBar.closeChip("status"))
    expect(result.current.chipBar.chips).toEqual([])
  })

  it("clears the chips and keeps the search", () => {
    const { result } = renderChipBar("/?tab=keep&search=al&status=Ready&owner=ann")
    act(() => result.current.chipBar.clearChips())
    expect([...new URLSearchParams(result.current.location.search)]).toEqual([
      ["tab", "keep"],
      ["search", "al"],
    ])
  })
})
