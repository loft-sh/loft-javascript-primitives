import React, { ReactNode } from "react"

import { cn } from "../../cn-utils"
import ColumnCustomization from "./ColumnCustomization"
import { TableNoFilterResults } from "./components/TableNoFilterResults"
import { DataTable, DataTableProps } from "./DataTable"
import { FilterDefinitions } from "./filters/definitions"
import { FilterChips, FilterMenu, FilterSearch } from "./filters/TableFilters"
import { useChipFilterBar } from "./filters/useChipFilterBar"
import { useFilterState } from "./filters/useFilterState"
import RefreshButton from "./RefreshButton"
import { useDataTable, UseDataTableOptions } from "./useDataTable"
import { XOr } from "@loft-enterprise/shared"

type Props<T, K extends string> = Omit<DataTableProps<T>, "table" | "expansionComponent"> &
  Omit<UseDataTableOptions<T>, "filterState" | "getSubRows"> &
  XOr<Pick<UseDataTableOptions<T>, "getSubRows">, Pick<DataTableProps<T>, "expansionComponent">> & {
    filters: FilterDefinitions<T, K>
    urlPrefix?: string
    filterControls?: ReactNode
    actions?: ReactNode
    refetch?: () => void | Promise<void>
    displayNames?: Record<string, string>
  }

export function DefaultDataTable<T, K extends string>({
  filters,
  urlPrefix,
  filterControls,
  actions,
  refetch,
  data,
  columns,
  getRowId,
  initialState,
  getSubRows,
  selectionResetKey,
  displayNames,
  emptyState,
  className,
  ...tableProps
}: Props<T, K>) {
  const filterState = useFilterState(filters, { urlPrefix })
  const chipBar = useChipFilterBar(filters, filterState)
  const table = useDataTable({
    data,
    columns,
    filterState,
    getRowId,
    initialState,
    getSubRows,
    selectionResetKey,
  })
  const disabled = table.getSelectedRowModel().flatRows.length > 0

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div>
        <div className="flex flex-wrap items-start gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <FilterSearch filters={filters} filterState={filterState} disabled={disabled} />
            <FilterMenu chipBar={chipBar} disabled={disabled} />
            {filterControls}
            <ColumnCustomization table={table} disabled={disabled} displayNames={displayNames} />
          </div>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            {actions}
            {refetch && <RefreshButton onRefresh={refetch} />}
          </div>
        </div>
        <FilterChips chipBar={chipBar} disabled={disabled} />
      </div>
      <DataTable
        table={table}
        emptyState={
          filterState.isFiltered && data?.length ? (
            <TableNoFilterResults onResetRequested={filterState.reset} />
          ) : (
            emptyState
          )
        }
        {...tableProps}
      />
    </div>
  )
}
