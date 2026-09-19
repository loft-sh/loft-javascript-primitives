// @vitest-environment browser

import { fireEvent, render, screen } from "@testing-library/react"
import React from "react"
import { MemoryRouter } from "react-router-dom"
import { describe, expect, it, vi } from "vitest"

import { DataTable } from "./DataTable"
import { makeBatchActionsColumn } from "./defaults"

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
      <MemoryRouter>
        <div style={{ paddingTop: 100 }}>
          <div id="tooltip-portal" />
          <DataTable
            data={grouped ? [{ name: "gpu-group-1" }, { name: "gpu-group-2" }] : items}
            subRowData={
              grouped ? { "gpu-group-1": items.slice(0, 2), "gpu-group-2": items.slice(2) } : {}
            }
            isSubRow={(item: { name: string }) => !item.name.startsWith("gpu-group")}
            columnKeyPath={["name"]}
            initialPageSize={1}
            columns={[
              makeBatchActionsColumn<{ name: string }>({
                isSelectable: (item) => ({
                  canSelect: item.name !== "gpu-disabled" && !item.name.startsWith("gpu-group"),
                }),
                actions: [{ label: "Assign", onClick: assign }],
              }),
              { accessorKey: "name", header: "Name", filterFn: "includesString" },
            ]}
            controls={(table) => (
              <>
                <button onClick={() => table.getColumn("name")?.setFilterValue("gpu")}>
                  Filter
                </button>
                <button onClick={() => table.getColumn("name")?.setFilterValue("gpu-")}>
                  Refine filter
                </button>
                <button onClick={() => table.nextPage()}>Next test page</button>
              </>
            )}
          />
        </div>
      </MemoryRouter>
    )
    const headerCheckbox = () => screen.getAllByRole("checkbox")[0]!
    const selectionBar = () => screen.getAllByRole("tooltip")[0]
    const selectAll = () =>
      fireEvent.click(screen.getAllByRole("button", { name: "Select All 2", exact: true })[0]!)
    fireEvent.click(screen.getByRole("button", { name: "Filter", exact: true }))
    fireEvent.click(headerCheckbox())
    expect((await screen.findAllByRole("tooltip"))[0]).toHaveTextContent(
      "1 item selected. Select All 2"
    )
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
      <MemoryRouter>
        <div id="tooltip-portal" />
        <DataTable
          data={[{ name: "parent" }]}
          subRowData={{ parent: [{ name: "child" }] }}
          isSubRow={(item: { name: string }) => item.name === "child"}
          columnKeyPath={["name"]}
          columns={[
            makeBatchActionsColumn<{ name: string }>({
              isSelectable: (item) => ({ canSelect: item.name === "parent" }),
              actions: [{ label: "Assign", onClick: assign }],
            }),
            { accessorKey: "name", header: "Name" },
          ]}
        />
      </MemoryRouter>
    )
    fireEvent.click(screen.getAllByRole("checkbox")[0]!)
    expect((await screen.findAllByRole("tooltip"))[0]).toHaveTextContent("All 1 item selected.")
    fireEvent.click(screen.getAllByRole("button", { name: "Assign", exact: true })[0]!)
    expect(assign.mock.calls[0]?.[0]).toEqual([{ name: "parent" }])
  })

  it("excludes filtered-out selections from the action payload", async () => {
    const assign = vi.fn()
    render(
      <MemoryRouter>
        <div id="tooltip-portal" />
        <DataTable
          data={[{ name: "visible" }, { name: "hidden" }]}
          subRowData={{}}
          isSubRow={() => false}
          columnKeyPath={["name"]}
          columns={[
            makeBatchActionsColumn<{ name: string }>({
              actions: [{ label: "Assign", onClick: assign }],
            }),
            { accessorKey: "name", header: "Name", filterFn: "includesString" },
          ]}
          controls={(table) => (
            <button
              onClick={() => {
                table.setRowSelection({ hidden: true })
                table.getColumn("name")?.setFilterValue("visible")
              }}>
              Select hidden row
            </button>
          )}
        />
      </MemoryRouter>
    )
    fireEvent.click(screen.getByRole("button", { name: "Select hidden row" }))
    expect(screen.queryByRole("button", { name: "Assign", exact: true })).not.toBeInTheDocument()
    fireEvent.click(screen.getAllByRole("checkbox")[0]!)
    expect((await screen.findAllByRole("tooltip"))[0]).toHaveTextContent("All 1 item selected.")
    fireEvent.click(screen.getAllByRole("button", { name: "Assign", exact: true })[0]!)
    expect(assign.mock.calls[0]?.[0]).toEqual([{ name: "visible" }])
  })
})
