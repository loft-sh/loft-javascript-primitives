import {
  createRow,
  functionalUpdate,
  getCoreRowModel,
  getExpandedRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  memo,
  PaginationState,
  Row,
  RowModel,
  RowSelectionState,
  Table,
  TableOptions,
  useReactTable,
} from "@tanstack/react-table"
import { useState } from "react"

import type { FilterState, FilterValues } from "./filters/useFilterState"
import type { ExtendedColumnDef } from "./types"

// A stable empty array: a new [] on each render would make TanStack rebuild every row model.
const NO_ROWS: never[] = []

// Calls the predicate once per row. TanStack's global filter would call it once per column.
function getPredicateFilteredRowModel<T>() {
  return (table: Table<T>) =>
    memo(
      () => {
        const matches: ((row: T) => boolean) | undefined = table.getState().globalFilter

        return [table.getCoreRowModel(), matches] as const
      },
      (model, matches): RowModel<T> => {
        if (!matches) return model
        const flatRows: Row<T>[] = []
        const rowsById: Record<string, Row<T>> = {}
        // A parent row stays while it matches or while one of its sub-rows does.
        const filter = (rows: Row<T>[]): Row<T>[] =>
          rows.flatMap((row) => {
            if (!row.subRows.length) {
              if (!matches(row.original)) return []
              flatRows.push(row)
              rowsById[row.id] = row

              return [row]
            }
            const parentIndex = flatRows.length
            const subRows = filter(row.subRows)
            if (!subRows.length && !matches(row.original)) return []
            const filtered = createRow(
              table,
              row.id,
              row.original,
              row.index,
              row.depth,
              undefined,
              row.parentId
            )
            filtered.subRows = subRows
            // flatRows lists a parent before its sub-rows, like TanStack's own row models.
            flatRows.splice(parentIndex, 0, filtered)
            rowsById[filtered.id] = filtered

            return [filtered]
          })

        return { rows: filter(model.rows), flatRows, rowsById }
      },
      { key: false }
    )
}

type TableView = {
  filterValues: FilterValues | undefined
  selectionResetKey: string | number | undefined
  pagination: PaginationState
  rowSelection: RowSelectionState
}

export type UseDataTableOptions<T> = {
  data: T[] | undefined
  columns: ExtendedColumnDef<T>[]
  getRowId: NonNullable<TableOptions<T>["getRowId"]>
  filterState?: Pick<FilterState<T>, "values" | "matches">
  selectionResetKey?: string | number
} & Pick<TableOptions<T>, "getSubRows" | "initialState">

export function useDataTable<T>({
  data = NO_ROWS,
  columns,
  filterState,
  selectionResetKey,
  initialState,
  ...options
}: UseDataTableOptions<T>) {
  const filterValues = filterState?.values
  const [stored, setStored] = useState<TableView>(() => ({
    filterValues,
    selectionResetKey,
    pagination: { pageIndex: 0, pageSize: initialState?.pagination?.pageSize ?? 10 },
    rowSelection: {},
  }))
  // A new filter or a new caller's key starts a new selection. A refetch keeps it.
  const freshView = (from: TableView): TableView =>
    from.filterValues === filterValues && from.selectionResetKey === selectionResetKey
      ? from
      : {
          filterValues,
          selectionResetKey,
          pagination:
            from.filterValues === filterValues
              ? from.pagination
              : { ...from.pagination, pageIndex: 0 },
          rowSelection: {},
        }
  const view = freshView(stored)
  // Commit the derived reset so returning to an earlier filter or key cannot
  // bring back its old page and selection.
  if (view !== stored) setStored(view)

  const table = useReactTable({
    ...options,
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getPredicateFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableGlobalFilter: false,
    state: {
      globalFilter: filterState?.matches,
      pagination: view.pagination,
      rowSelection: view.rowSelection,
    },
    onPaginationChange: (updater) =>
      setStored((previous) => {
        const base = freshView(previous)

        return { ...base, pagination: functionalUpdate(updater, base.pagination) }
      }),
    onRowSelectionChange: (updater) =>
      setStored((previous) => {
        const base = freshView(previous)

        return { ...base, rowSelection: functionalUpdate(updater, base.rowSelection) }
      }),
    autoResetPageIndex: false,
    autoResetExpanded: false,
    paginateExpandedRows: false,
    columnResizeMode: "onChange",
    columnResizeDirection: "ltr",
    defaultColumn: { minSize: 90 },
    initialState: {
      sorting: columns.some((column) => column.id === "created")
        ? [{ id: "created", desc: true }]
        : columns[0]?.id
          ? [{ id: columns[0].id, desc: false }]
          : [],
      columnPinning: {
        right: columns.some((column) => column.id === "actions") ? ["actions"] : [],
      },
      ...initialState,
    },
  })

  const lastPage = Math.max(0, table.getPageCount() - 1)
  if (view.pagination.pageIndex > lastPage) table.setPageIndex(lastPage)

  // Committed, not only hidden: a row created again under the same ID must not come back selected.
  const { rowsById } = table.getCoreRowModel()
  if (Object.keys(view.rowSelection).some((id) => !rowsById[id])) {
    table.setRowSelection((selection) =>
      Object.fromEntries(Object.entries(selection).filter(([id]) => rowsById[id]))
    )
  }

  return table
}
