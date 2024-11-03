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
import { AnimatePresence, motion } from "framer-motion"
import React, { CSSProperties, Key, useEffect, useRef, useState } from "react"

import ColumnCustomization from "./ColumnCustomization"
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
}: Props<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "created",
      desc: true,
    },
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
      minSize: 120,
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
      setSorting([
        {
          id: "created",
          desc: true,
        },
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

  const [hoveredHeader, setHoveredHeader] = useState<string | undefined>(undefined)

  return (
    <div className="rounded-md border">
      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-row items-center gap-2">
          {controls(table)}
          <Button
            data-visible={shouldShowResetFiltersButton}
            variant="ghost"
            className="opacity-0 transition-opacity data-[visible=true]:opacity-100"
            onClick={() => {
              table.resetColumnFilters()
            }}>
            Reset Filters
          </Button>
        </div>
        {columnCustomization && <ColumnCustomization table={table} />}
      </div>
      <Table
        hasPagination={showPagination && table.getPageCount() > 1}
        ref={tableRef}
        style={{
          width: shouldTableBeFullWidth || data?.length === 0 ? "100%" : table.getTotalSize(),
        }}>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const size = header.getSize()
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
                    }}
                    onMouseEnter={() => setHoveredHeader(header.id)}
                    onMouseLeave={() => setHoveredHeader(undefined)}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                    {acceptsResizing && (
                      <div
                        className={`absolute right-0 top-0 h-[38px] w-[0.1875rem] cursor-col-resize touch-none select-none bg-primary-main transition-opacity duration-300 ${
                          hoveredHeader === header.id ? "opacity-100" : "opacity-0"
                        } ${table.options.columnResizeDirection} ${
                          header.column.getIsResizing() ? "isResizing" : ""
                        }
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
          <AnimatePresence mode="popLayout">
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => {
                const key = columnKeyPath
                  ? columnKeyPath.reduce(
                      (acc, key) => (acc as Record<string, any>)[key],
                      row.original
                    )
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

                        return (
                          <TableCell
                            key={cell.id}
                            data-opacity-transition={
                              isPinned && !isRowHovered && !shouldMenuAppearOnHover
                            }
                            className={`overflow-x-hidden text-ellipsis whitespace-nowrap data-[opacity-transition=false]:duration-200 data-[opacity-transition=true]:duration-300 ${isPinned && row.id === hoveredRow ? "opacity-100" : ""}`}
                            style={{
                              maxWidth: cell.column.getSize(),
                              ...getCommonPinningStyles(cell.column, shouldMenuAppearOnHover),
                              opacity:
                                isPinned && !isRowHovered && !shouldMenuAppearOnHover ? 0 : 1,
                            }}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        )
                      })}
                    </TableRow>
                  </DataTableRowContext.Provider>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24">
                  {!hasInitiallyLoaded && loading ? (
                    <div className="flex h-full flex-col items-center justify-center">
                      Loading ...
                    </div>
                  ) : null}

                  {hasInitiallyLoaded && data?.length === 0
                    ? emptyState
                      ? emptyState
                      : "No data"
                    : null}

                  {error && error.val?.message && (
                    <span className="bg-danger-extra-light p-2 text-danger-main">
                      {error.val.message}
                    </span>
                  )}
                </TableCell>
              </TableRow>
            )}
          </AnimatePresence>
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

export { DataTable }
