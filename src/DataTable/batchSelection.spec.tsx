// @vitest-environment browser

import { Table } from "@tanstack/react-table"
import { fireEvent, render, screen } from "@testing-library/react"
import React, { ReactNode, useMemo, useState } from "react"
import { MemoryRouter } from "react-router-dom"
import { describe, expect, it, vi } from "vitest"

import { DataTable } from "./DataTable"
import { makeBatchActionsColumn } from "./defaults"
import type { FilterValues } from "./filters/useFilterState"
import { useDataTable } from "./useDataTable"

type Item = { name: string; items?: Item[] }

function SelectionTable({
  data,
  isSelectable,
  assign,
  pageSize = 10,
  controls,
}: {
  data: Item[]
  isSelectable?: (item: Item) => { canSelect: boolean }
  assign: (items: Item[]) => void
  pageSize?: number
  controls?: (table: Table<Item>, setQuery: (query: string) => void) => ReactNode
}) {
  const [query, setQuery] = useState<string>()
  const values = useMemo((): FilterValues => (query ? { name: [query] } : {}), [query])
  const columns = useMemo(
    () => [
      makeBatchActionsColumn<Item>({
        isSelectable,
        actions: [{ label: "Assign", onClick: assign }],
      }),
      { accessorKey: "name", header: "Name" },
    ],
    [isSelectable, assign]
  )
  const table = useDataTable({
    data,
    columns,
    getRowId: (item) => item.name,
    getSubRows: (item) => item.items,
    initialState: { pagination: { pageIndex: 0, pageSize } },
    filterState: { values, matches: query ? (item) => item.name.includes(query) : undefined },
  })

  return (
    <MemoryRouter>
      <div style={{ paddingTop: 100 }}>
        <div id="tooltip-portal" />
        {controls?.(table, setQuery)}
        <DataTable table={table} />
      </div>
    </MemoryRouter>
  )
}

describe("batch selection across pages", () => {
  it.each([false, true])("offers page and all-matches selection: grouped=%s", async (grouped) => {
    const items = [
      { name: "gpu-1" },
      { name: "cpu-1" },
      { name: "gpu-2" },
      { name: "gpu-disabled" },
    ]
    const assign = vi.fn()
    render(
      <SelectionTable
        data={
          grouped
            ? [
                { name: "gpu-group-1", items: items.slice(0, 2) },
                { name: "gpu-group-2", items: items.slice(2) },
              ]
            : items
        }
        pageSize={1}
        isSelectable={(item) => ({
          canSelect: item.name !== "gpu-disabled" && !item.name.startsWith("gpu-group"),
        })}
        assign={assign}
        controls={(table, setQuery) => (
          <>
            <button onClick={() => setQuery("gpu")}>Filter</button>
            <button onClick={() => setQuery("gpu-")}>Refine filter</button>
            <button onClick={() => table.nextPage()}>Next test page</button>
          </>
        )}
      />
    )
    const headerCheckbox = () => screen.getAllByRole("checkbox")[0]!
    const selectionBar = () =>
      screen.getByRole("toolbar", { name: "Selected row actions", exact: true })
    const selectAll = () =>
      fireEvent.click(screen.getAllByRole("button", { name: "Select All 2", exact: true })[0]!)
    fireEvent.click(screen.getByRole("button", { name: "Filter", exact: true }))
    fireEvent.click(headerCheckbox())
    expect(
      await screen.findByRole("toolbar", { name: "Selected row actions", exact: true })
    ).toHaveTextContent("1 item selected. Select All 2")
    fireEvent.click(headerCheckbox())
    expect(screen.queryAllByRole("tooltip")).toHaveLength(0)
    fireEvent.click(headerCheckbox())
    fireEvent.click(screen.getByRole("button", { name: "Next test page" }))
    expect(selectionBar()).toHaveTextContent("1 item selected. Select All 2")
    expect(headerCheckbox()).not.toBeChecked()
    fireEvent.click(headerCheckbox())
    expect(selectionBar()).toHaveTextContent("All 2 items selected.")
    expect(headerCheckbox()).toBeChecked()
    fireEvent.click(headerCheckbox())
    expect(screen.queryAllByRole("tooltip")).toHaveLength(0)
    fireEvent.click(headerCheckbox())
    expect(selectionBar()).toHaveTextContent("1 item selected. Select All 2")
    selectAll()
    expect(selectionBar()).toHaveTextContent("All 2 items selected.")
    expect(headerCheckbox()).toBeChecked()
    fireEvent.click(screen.getByRole("button", { name: "Refine filter" }))
    expect(screen.queryAllByRole("tooltip")).toHaveLength(0)
    fireEvent.click(headerCheckbox())
    selectAll()
    fireEvent.click(screen.getAllByRole("button", { name: "Assign", exact: true })[0]!)
    expect(assign.mock.calls[0]?.[0]).toEqual([{ name: "gpu-1" }, { name: "gpu-2" }])
  })
})

describe("batch selection exclusions", () => {
  it("excludes non-selectable children from the action payload", async () => {
    const assign = vi.fn()
    render(
      <SelectionTable
        data={[{ name: "parent", items: [{ name: "child" }] }]}
        isSelectable={(item) => ({ canSelect: item.name === "parent" })}
        assign={assign}
      />
    )
    fireEvent.click(screen.getAllByRole("checkbox")[0]!)
    expect(
      await screen.findByRole("toolbar", { name: "Selected row actions", exact: true })
    ).toHaveTextContent("All 1 item selected.")
    fireEvent.click(screen.getAllByRole("button", { name: "Assign", exact: true })[0]!)
    expect(assign.mock.calls[0]?.[0]).toEqual([{ name: "parent", items: [{ name: "child" }] }])
  })

  it("excludes filtered-out selections from the action payload", async () => {
    const assign = vi.fn()
    render(
      <SelectionTable
        data={[{ name: "visible" }, { name: "hidden" }]}
        assign={assign}
        controls={(table, setQuery) => (
          <>
            <button onClick={() => setQuery("visible")}>Filter</button>
            <button onClick={() => table.setRowSelection({ hidden: true })}>
              Select hidden row
            </button>
          </>
        )}
      />
    )
    fireEvent.click(screen.getByRole("button", { name: "Filter", exact: true }))
    fireEvent.click(screen.getByRole("button", { name: "Select hidden row" }))
    expect(screen.queryByRole("button", { name: "Assign", exact: true })).not.toBeInTheDocument()
    fireEvent.click(screen.getAllByRole("checkbox")[0]!)
    expect(
      await screen.findByRole("toolbar", { name: "Selected row actions", exact: true })
    ).toHaveTextContent("All 1 item selected.")
    fireEvent.click(screen.getAllByRole("button", { name: "Assign", exact: true })[0]!)
    expect(assign.mock.calls[0]?.[0]).toEqual([{ name: "visible" }])
  })
})
