import { act, renderHook } from "@testing-library/react"
import React, { ReactNode } from "react"
import { MemoryRouter, useLocation } from "react-router-dom"
import { describe, expect, it } from "vitest"

import { FilterFn, useFilterState, useLocalFilterState } from "./useFilterState"

type Row = { name: string; status: string }
const rows: Row[] = [
  { name: "alpha", status: "Ready" },
  { name: "beta", status: "Failed" },
]
const filters: Record<"search" | "status" | "owner", { filterFn?: FilterFn<Row> }> = {
  search: {},
  status: { filterFn: (row, statuses) => statuses.includes(row.status) },
  owner: {},
}

function renderFilterState(initialEntry: string, urlPrefix?: string) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[initialEntry]}>{children}</MemoryRouter>
  )

  return renderHook(
    () => ({
      filterState: useFilterState(filters, { urlPrefix }),
      location: useLocation(),
    }),
    { wrapper }
  )
}

function params(search: string) {
  return [...new URLSearchParams(search)]
}

describe("useFilterState", () => {
  it("reads and writes its prefixed keys only", () => {
    const { result } = renderFilterState("/?search=page&activitySearch=audit", "activity")
    expect(result.current.filterState.values).toEqual({ search: ["audit"] })
    act(() => result.current.filterState.setValue("search", ["changed"]))
    expect(params(result.current.location.search)).toEqual([
      ["search", "page"],
      ["activitySearch", "changed"],
    ])
  })

  it("applies two updates in one event and keeps each key at its position", () => {
    const { result } = renderFilterState("/?tab=keep&status=Ready&search=al")
    act(() => {
      result.current.filterState.setValue("status", ["Ready", "Failed"])
      result.current.filterState.setValue("owner", ["ann"])
    })
    expect(params(result.current.location.search)).toEqual([
      ["tab", "keep"],
      ["status", "Ready"],
      ["status", "Failed"],
      ["search", "al"],
      ["owner", "ann"],
    ])
  })

  it("keeps the values object while other URL params change", () => {
    const { result } = renderFilterState("/?status=Ready&status=")
    const { values } = result.current.filterState
    expect(values).toEqual({ status: ["Ready"] })
    act(() => result.current.filterState.setValue("status", ["Ready"]))
    expect(result.current.filterState.values).toBe(values)
  })

  it("matches rows against every client filter and ignores server filters", () => {
    const { result } = renderFilterState("/?status=Ready&owner=ann")
    expect(rows.filter((row) => result.current.filterState.matches?.(row))).toEqual([rows[0]])
    expect(result.current.filterState.isFiltered).toBe(true)
    const unfiltered = renderFilterState("/?owner=ann")
    expect(unfiltered.result.current.filterState.matches).toBeUndefined()
    expect(unfiltered.result.current.filterState.isFiltered).toBe(true)
  })

  it("resets every filter and keeps the other params", () => {
    const { result } = renderFilterState("/?tab=keep&search=al&status=Ready&owner=ann")
    act(() => result.current.filterState.reset())
    expect(params(result.current.location.search)).toEqual([["tab", "keep"]])
    expect(result.current.filterState.isFiltered).toBe(false)
  })
})

describe("useLocalFilterState", () => {
  it("keeps values out of the URL, keeps key order, and drops cleared keys", () => {
    const { result } = renderHook(() => useLocalFilterState(filters))
    act(() => {
      result.current.setValue("status", ["Failed"])
      result.current.setValue("search", ["al"])
    })
    act(() => result.current.setValue("status", ["Ready"]))
    expect(Object.entries(result.current.values)).toEqual([
      ["status", ["Ready"]],
      ["search", ["al"]],
    ])
    expect(rows.filter((row) => result.current.matches?.(row))).toEqual([rows[0]])

    act(() => result.current.setValue("status", []))
    expect(result.current.values).toEqual({ search: ["al"] })
    expect(result.current.matches).toBeUndefined()
    act(() => result.current.reset())
    expect(result.current.isFiltered).toBe(false)
  })
})
