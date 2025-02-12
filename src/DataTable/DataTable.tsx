import {
  Column,
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  Table as ReactTable,
  SortingState,
  useReactTable,
} from "@tanstack/react-table"
import { motion } from "framer-motion"
import React, { CSSProperties, Key, useEffect, useRef, useState } from "react"
import { useHistory } from "react-router-dom"

import ColumnCustomization from "./ColumnCustomization"
import TableNoFilterResults from "./components/TableNoFilterResults"
import { DataTableRowContext } from "./DataTableRowContext"
import TablePagination from "./Pagination"
import useMenuVisibility from "./useMenuVisibility"
import { ResultError } from "@loft-enterprise/client"
import {
  Button,
  cn,
  TableRow as NormalTableRow,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TSelectOptionType,
} from "@loft-enterprise/primitives"

type NameAndStatusFilter = {
  name: string
  status: TSelectOptionType[]
}

const TableRow = motion(NormalTableRow)

type Props<TData, TValue> = {
  data: TData[] | undefined
  className?: string
  columns: ColumnDef<TData, TValue>[]
  controls: (table: ReactTable<TData>) => React.ReactNode
  columnCustomization?: boolean
  showPagination?: boolean
  pageSize?: number
  loading?: boolean
  error?: ResultError | undefined
  showResetFiltersButton?: boolean
  resetTableKey?: string
  columnKeyPath?: string[]
  onRowClick?: (rowKey: Key, rowId: string) => void
  emptyState?: React.ReactNode
}

const DEFAULT_PAGE_SIZE = 10

function getCommonPinningStyles<TData>(
  column: Column<TData>,
  shouldMenuAppearOnHover: boolean,
  isHeader?: boolean
): CSSProperties {
  const isPinned = column.getIsPinned()

  return {
    left: isPinned === "left" ? `${column.getStart("left")}px` : undefined,
    right: isPinned === "right" ? `${column.getAfter("right")}px` : undefined,
    position: isPinned && !shouldMenuAppearOnHover ? "sticky" : "initial",
    zIndex: isPinned && isHeader ? -1 : undefined,
    pointerEvents: isPinned && isHeader ? "none" : undefined,
    width: column.getSize(),
  }
}

function DataTable<TData, TValue>({
  data,
  columns,
  controls,
  columnCustomization,
  showPagination = true,
  loading = false,
  error,
  pageSize = DEFAULT_PAGE_SIZE,
  showResetFiltersButton,
  resetTableKey,
  columnKeyPath,
  emptyState,
  onRowClick,
  className,
}: Props<TData, TValue>) {
  const history = useHistory()
  const isCreatedColumn = columns.find((column) => column.id === "created")
  const [sorting, setSorting] = useState<SortingState>([
    isCreatedColumn ? { id: "created", desc: true } : { id: columns[0]?.id as string, desc: false },
  ])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [hoveredRow, setHoveredRow] = useState<string | undefined>(undefined)
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  })

  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false)

  useEffect(() => {
    if (!loading && !hasInitiallyLoaded) {
      setHasInitiallyLoaded(true)
    }
  }, [hasInitiallyLoaded, loading])

  const tableRef = useRef<HTMLTableElement>(null)

  const table = useReactTable({
    data: data || [],
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    enableMultiRowSelection: true,
    autoResetPageIndex: false,
    autoResetExpanded: false,
    columnResizeMode: "onChange",
    columnResizeDirection: "ltr",
    defaultColumn: {
      minSize: 90,
    },
    state: {
      pagination,
      sorting,
      columnFilters,
      columnPinning: {
        right: ["actions"],
      },
    },
  })
  const { shouldMenuAppearOnHover, shouldTableBeFullWidth } = useMenuVisibility({ tableRef, table })

  const areFiltersSet = columnFilters.some((filter) => {
    if (filter.value === undefined) {
      return false
    }

    if (Array.isArray(filter.value)) {
      return filter.value.length !== 0
    }

    const filterValue = filter.value as NameAndStatusFilter
    if (filterValue.name) {
      return filterValue.name !== ""
    }

    if (filterValue.status) {
      return filterValue.status.length !== 0
    }

    return filter.value !== ""
  })

  const shouldShowResetFiltersButton = showResetFiltersButton && areFiltersSet

  useEffect(() => {
    function resetTable() {
      setPagination({
        pageIndex: 0,
        pageSize,
      })
      setColumnFilters([])
      if (hasInitiallyLoaded) {
        history.replace({ search: "" })
      }
      setSorting([
        isCreatedColumn
          ? { id: "created", desc: true }
          : { id: columns[0]?.id as string, desc: false },
      ])
      table.toggleAllRowsSelected(false)
    }
    if (resetTableKey) {
      resetTable()
    }
  }, [pageSize, resetTableKey, table])

  const isResizing =
    table.getState().columnSizingInfo.deltaOffset !== undefined &&
    table.getState().columnSizingInfo.deltaOffset !== 0 &&
    table.getState().columnSizingInfo.deltaOffset !== null

  const isLoading = !hasInitiallyLoaded && loading
  const isEmpty = hasInitiallyLoaded && (data?.length === 0 || data === undefined)

  const hasError = error && error.val?.message

  const hasActiveFilters = columnFilters.some((filter) => isFilterSet(filter.value as FilterValue))

  const hasFilteredResults =
    hasActiveFilters && data && data.length > 0 && table.getRowModel().rows.length === 0

  const shouldDisableHover = isLoading || isEmpty || hasError || hasFilteredResults

  const shouldTableBeFullWidthMain = shouldTableBeFullWidth || data?.length === 0

  const handleResetFilters = () => {
    history.replace({ search: "" })
    table.resetColumnFilters()
  }

  return (
    <div className={cn("rounded-md border", className)}>
      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-row items-center gap-2">
          {controls(table)}

          <Button
            data-visible={shouldShowResetFiltersButton}
            variant="ghost"
            className="opacity-0 transition-opacity data-[visible=false]:h-0 data-[visible=true]:opacity-100"
            onClick={handleResetFilters}>
            Reset Filters
          </Button>
        </div>
        {columnCustomization && <ColumnCustomization table={table} />}
      </div>
      <Table
        containerClassName={cn("overflow-hidden", {
          "overflow-hidden": hasFilteredResults || isEmpty,
          "hover:overflow-auto": !hasFilteredResults && !isEmpty,
        })}
        hasPagination={showPagination && table.getPageCount() > 1}
        ref={tableRef}
        style={{
          width: shouldTableBeFullWidthMain ? "100%" : table.getTotalSize(),
        }}>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const size = header.column.getSize()
                const acceptsResizing = header.column.getCanResize()

                return (
                  <TableHead
                    key={header.id}
                    // react-table sets the position to the header to initial, hence we need to force it.
                    className={`!relative ${isResizing ? "cursor-col-resize" : ""}`}
                    style={{
                      maxWidth: size,
                      whiteSpace: "nowrap",
                      width: header.getSize(),
                      ...getCommonPinningStyles(header.column, shouldMenuAppearOnHover, true),
                    }}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                    {acceptsResizing && (
                      <div
                        className={`absolute right-0 top-0 h-[38px] w-[0.1875rem] cursor-col-resize touch-none select-none transition-opacity duration-300 ${
                          header.column.getIsResizing()
                            ? "isResizing bg-primary-main"
                            : "bg-transparent hover:bg-primary-main"
                        } ${table.options.columnResizeDirection}
                      before:absolute before:bottom-0 before:left-[-10px] before:top-0 before:w-[10px] before:cursor-col-resize before:content-['']`}
                        {...{
                          onDoubleClick: () => header.column.resetSize(),
                          onMouseDown: header.getResizeHandler(),
                          onTouchStart: header.getResizeHandler(),
                        }}
                        style={{
                          transform:
                            table.options.columnResizeMode === "onEnd" &&
                            header.column.getIsResizing()
                              ? `translateX(${
                                  (table.options.columnResizeDirection === "rtl" ? -1 : 1) *
                                  (table.getState().columnSizingInfo.deltaOffset ?? 0)
                                }px)`
                              : "",
                        }}></div>
                    )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => {
              const key = columnKeyPath
                ? columnKeyPath.reduce((acc, key) => {
                    if (acc === undefined || acc === null) {
                      return row.id
                    }

                    return (acc as Record<string, any>)[key]
                  }, row.original)
                : row.id

              return (
                <DataTableRowContext.Provider
                  key={key as Key}
                  value={{ hoveredRow: hoveredRow, rowId: row.id }}>
                  <TableRow
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.05 }}
                    className={cn({
                      "cursor-pointer": !!onRowClick,
                    })}
                    onClick={() => {
                      onRowClick?.(key as Key, row.id)
                    }}
                    data-row-key={key as Key}
                    data-state={row.getIsSelected() && "selected"}
                    onMouseOver={() => setHoveredRow(row.id)}
                    onMouseLeave={() => setHoveredRow(undefined)}>
                    {row.getVisibleCells().map((cell) => {
                      const isPinned = cell.column.getIsPinned()
                      const isRowHovered = row.id === hoveredRow
                      const shouldFrostCell = shouldMenuAppearOnHover

                      const hideActions = isPinned && !isRowHovered && !shouldMenuAppearOnHover

                      return (
                        <TableCell
                          key={cell.id}
                          data-opacity-transition={
                            isPinned && !isRowHovered && !shouldMenuAppearOnHover
                          }
                          className={cn(
                            "overflow-x-hidden text-ellipsis whitespace-nowrap text-xs text-primary",

                            {
                              "opacity-0": hideActions,
                              "bg-transparent hover:bg-transparent group-hover:bg-transparent":
                                isPinned,
                              "p-0": isPinned,
                            }
                          )}
                          style={{
                            maxWidth: cell.column.getSize(),
                            ...getCommonPinningStyles(cell.column, shouldMenuAppearOnHover),
                          }}>
                          {isPinned ? (
                            <FrostedCell frostCell={shouldFrostCell}>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </FrostedCell>
                          ) : (
                            flexRender(cell.column.columnDef.cell, cell.getContext())
                          )}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                </DataTableRowContext.Provider>
              )
            })
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className={cn(
                  "relative h-24",
                  shouldDisableHover ? "hover:bg-white group-hover:bg-white" : ""
                )}>
                {isLoading ? (
                  <div className="flex h-full flex-col items-center justify-center">
                    Loading ...
                  </div>
                ) : null}

                {isEmpty ? (
                  emptyState ? (
                    <div style={{ maxWidth: tableRef.current?.clientWidth }}>{emptyState}</div>
                  ) : (
                    "No data"
                  )
                ) : null}

                {hasError ? (
                  <span className="bg-danger-extra-light p-2 text-danger-main">
                    {error.val.message}
                  </span>
                ) : null}

                {hasFilteredResults && (
                  <TableNoFilterResults maxWidth={tableRef.current?.clientWidth} table={table} />
                )}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {showPagination && (
        <TablePagination
          table={table}
          tableSize={table.getTotalSize()}
          pageIndex={pagination.pageIndex}
          pageCount={table.getPageCount()}
        />
      )}
    </div>
  )
}

type FilterValue = string | number | boolean | NameAndStatusFilter | unknown[]

function isFilterSet(value: FilterValue): boolean {
  if (value === undefined || value === null) {
    return false
  }

  if (typeof value === "string") {
    return value.trim() !== ""
  }

  if (Array.isArray(value)) {
    return value.length > 0
  }

  // Handle the NameAndStatusFilter type
  if (typeof value === "object" && "name" in value && "status" in value) {
    const typedValue = value as NameAndStatusFilter

    return typedValue.name.trim() !== "" || typedValue.status.length > 0
  }

  return true
}

type FrostedCellProps = {
  children: React.ReactNode
  className?: string
  frostCell?: boolean
}

function FrostedCell({ children, className, frostCell }: FrostedCellProps) {
  return (
    <div className={cn("relative h-full w-full", className)}>
      <div
        className={cn(
          "absolute left-0 top-0 h-full w-full from-table-cell-hover/5 from-0% via-table-cell-hover via-[30%] to-table-cell-hover backdrop-blur-[4px] transition-all group-hover:bg-gradient-to-r",
          {
            "bg-table-cell group-hover:bg-table-cell-hover": frostCell,
          }
        )}
      />
      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center gap-2 px-4 py-2.5">
        {children}
      </div>
    </div>
  )
}

export { DataTable }
