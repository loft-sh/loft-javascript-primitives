import { act, render, renderHook, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import React from "react"
import { MemoryRouter } from "react-router-dom"
import { describe, expect, it, vi } from "vitest"

import { DataTable } from "./DataTable"
import type { FilterValues } from "./filters/useFilterState"
import { useDataTable } from "./useDataTable"

type Row = { name: string }
const rows: Row[] = [{ name: "alpha" }, { name: "beta" }, { name: "gamma" }]
const columns = [{ id: "name", accessorKey: "name", header: "Name" }]
const getRowId = (row: Row) => row.name
const initialState = { pagination: { pageIndex: 0, pageSize: 1 } }
const unfiltered: FilterValues = {}
const betaApplied: FilterValues = { search: ["beta"] }

describe("DataTable", () => {
  it("pins the actions column to the right", () => {
    const { result } = renderHook(() =>
      useDataTable({
        data: rows,
        columns: [...columns, { id: "actions", cell: () => "Edit" }],
        getRowId,
      })
    )

    expect(result.current.getState().columnPinning.right).toEqual(["actions"])
    expect(result.current.getColumn("actions")?.getIsPinned()).toBe("right")
  })

  it("sorts by created, newest first, or else by the first column", () => {
    const byCreated = renderHook(() =>
      useDataTable({ data: rows, columns: [...columns, { id: "created" }], getRowId })
    )
    expect(byCreated.result.current.getState().sorting).toEqual([{ id: "created", desc: true }])
    const byFirstColumn = renderHook(() => useDataTable({ data: rows, columns, getRowId }))
    expect(byFirstColumn.result.current.getState().sorting).toEqual([{ id: "name", desc: false }])
  })

  it("filters once per row, keeps parents of matching rows, and preserves nested row IDs", () => {
    type Nested = { name: string; children?: Nested[] }
    const data: Nested[] = [
      { name: "parent", children: [{ name: "keep" }, { name: "drop-child" }] },
      { name: "drop-parent", children: [{ name: "kept-child" }] },
      { name: "drop" },
    ]
    const matches = vi.fn((row: Nested) => !row.name.startsWith("drop"))
    const { result } = renderHook(() =>
      useDataTable({
        data,
        columns: [{ id: "label", cell: (info) => info.row.original.name }, { id: "extra" }],
        getRowId: (row) => row.name,
        getSubRows: (row) => row.children,
        filterState: { values: unfiltered, matches },
      })
    )
    const model = result.current.getFilteredRowModel()
    expect(model.rows.map((row) => row.id)).toEqual(["parent", "drop-parent"])
    expect(model.rows[0]!.subRows.map((row) => row.id)).toEqual(["keep"])
    expect(model.rows[1]!.subRows.map((row) => row.id)).toEqual(["kept-child"])
    expect(model.flatRows.map((row) => row.id)).toEqual([
      "parent",
      "keep",
      "drop-parent",
      "kept-child",
    ])
    expect(Object.keys(model.rowsById).sort()).toEqual([
      "drop-parent",
      "keep",
      "kept-child",
      "parent",
    ])
    expect(result.current.getCoreRowModel().flatRows).toHaveLength(6)
    // Each leaf once; a parent only when none of its sub-rows stays.
    expect(matches).toHaveBeenCalledTimes(4)
    result.current.getFilteredRowModel()
    expect(matches).toHaveBeenCalledTimes(4)
  })

  it("keeps the view on refresh and resets it when the filter values change", () => {
    const initialProps: {
      data: Row[]
      matches?: (row: Row) => boolean
      values: FilterValues
    } = { data: rows, values: unfiltered }
    const { result, rerender } = renderHook(
      ({ data, matches, values }) =>
        useDataTable({
          data,
          columns,
          filterState: { values, matches },
          initialState,
          getRowId,
        }),
      { initialProps }
    )
    act(() => {
      result.current.setSorting([{ id: "name", desc: true }])
      result.current.setPageIndex(1)
    })
    act(() => result.current.setRowSelection({ beta: true }))
    rerender({ data: [...rows], matches: (row) => row.name.length > 0, values: unfiltered })
    expect(result.current.getState().pagination.pageIndex).toBe(1)
    expect(result.current.getState().rowSelection).toEqual({ beta: true })
    expect(result.current.getFilteredRowModel().rows).toHaveLength(3)
    rerender({ data: rows, matches: (row) => row.name === "beta", values: betaApplied })
    expect(result.current.getState().pagination.pageIndex).toBe(0)
    expect(result.current.getState().rowSelection).toEqual({})
    expect(result.current.getCoreRowModel().rows).toHaveLength(3)
    expect(result.current.getFilteredRowModel().rows.map((row) => row.original.name)).toEqual([
      "beta",
    ])
    rerender({ data: rows, matches: (row) => row.name.length > 0, values: unfiltered })
    expect(result.current.getState().pagination.pageIndex).toBe(0)
    expect(result.current.getState().rowSelection).toEqual({})
  })

  it("keeps the selection across refetches, drops removed rows, and clears on the caller's key", () => {
    const initialProps: { data: Row[]; selectionResetKey?: string } = { data: rows }
    const { result, rerender } = renderHook(
      ({ data, selectionResetKey }) => useDataTable({ data, columns, getRowId, selectionResetKey }),
      { initialProps }
    )

    act(() => result.current.setRowSelection({ alpha: true, beta: true }))
    rerender({ data: [...rows, { name: "delta" }] })
    expect(result.current.getState().rowSelection).toEqual({ alpha: true, beta: true })
    rerender({ data: rows.filter((row) => row.name !== "beta") })
    expect(result.current.getState().rowSelection).toEqual({ alpha: true })
    rerender({ data: rows })
    expect(result.current.getState().rowSelection).toEqual({ alpha: true })

    rerender({ data: rows, selectionResetKey: "new-membership" })
    expect(result.current.getState().rowSelection).toEqual({})
  })

  it("keeps clicks on controls inside a row away from the row click", async () => {
    const onRowClick = vi.fn()
    const onButtonClick = vi.fn()
    function ClickableTable() {
      const table = useDataTable({
        data: rows,
        getRowId,
        columns: [
          ...columns,
          {
            id: "actions",
            cell: () => (
              <button type="button" onClick={onButtonClick}>
                Edit
              </button>
            ),
          },
        ],
      })

      return (
        <MemoryRouter>
          <DataTable table={table} onRowClick={(row) => onRowClick(row.id)} />
        </MemoryRouter>
      )
    }
    const user = userEvent.setup()
    render(<ClickableTable />)
    await user.click(screen.getAllByRole("button", { name: "Edit" })[0]!)
    expect(onButtonClick).toHaveBeenCalledTimes(1)
    expect(onRowClick).not.toHaveBeenCalled()
    await user.click(screen.getByText("beta"))
    expect(onRowClick).toHaveBeenCalledWith("beta")
  })
})
