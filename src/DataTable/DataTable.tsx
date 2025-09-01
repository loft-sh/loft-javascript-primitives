import {
  Column,
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Header,
  PaginationState,
  Table as ReactTable,
  Row,
  RowData,
  SortingState,
  useReactTable,
} from "@tanstack/react-table"
import { motion } from "framer-motion"
import React, { CSSProperties, Key, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useHistory } from "react-router-dom"

import { MaybeContainer } from "../MaybeContainer"
import ColumnCustomization from "./ColumnCustomization"
import TableNoFilterResults from "./components/TableNoFilterResults"
import { DataTableRowContext } from "./DataTableRowContext"
import { DataTableSkeleton, mockColumns } from "./DataTableSkeleton"
import TablePagination from "./Pagination"
import RefreshButton from "./RefreshButton"
import useMenuVisibility from "./useMenuVisibility"
import { ResultError } from "@loft-enterprise/client"
import { DownloadOutlined, MinusSquareOutlined, PlusSquareOutlined } from "@loft-enterprise/icons"
import {
  Button,
  cn,
  TableRow as NormalTableRow,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  Tooltip,
  TSelectOptionType,
} from "@loft-enterprise/primitives"
import { XOr } from "@loft-enterprise/shared"

type NameAndStatusFilter = {
  name: string
  status: TSelectOptionType[]
}

const TableRow = motion(NormalTableRow)

export function DataTableRow(props: React.ComponentPropsWithoutRef<typeof TableRow>) {
  return (
    <TableRow
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.05 }}
      {...props}
    />
  )
}

export type ExtendedColumnDef<
  TData extends RowData,
  TSubRowData extends RowData = unknown,
> = ColumnDef<TData> & {
  sortOnClick?: boolean
  cellClassName?: string
  subRowCell?: (props: TSubRowData) => any
}

type Props<TData, TSubRowData = unknown> = {
  data: TData[] | undefined
  className?: string
  variant?: "default" | "slim"
  controlsRowClassName?: string
  columns: ExtendedColumnDef<TData, TSubRowData>[]
  controls: (table: ReactTable<TData>) => React.ReactNode
  columnCustomization?: boolean
  showPagination?: boolean
  defaultSortingColumn?: string
  pageSize?: number
  loading?: boolean
  error?: ResultError | undefined
  showResetFiltersButton?: boolean
  permanentScrollbar?: boolean
  resetTableKey?: string
  columnKeyPath?: string[]
  onRowClick?: (rowKey: Key, rowId: string, subRowId?: string) => void
  emptyState?: React.ReactNode
  columnDisplayNames?: Record<string, string>
  initialColumnVisibility?: Record<string, boolean>
  onDownload?: (table: ReactTable<TData>) => void
  refetch?: () => void | Promise<void>
} & XOr<
  {
    // Enforce either both or none are set.
    subRowData: { [key: string]: TSubRowData[] }
    subRowColumnKeyPath: string[]
  },
  {}
>

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

function DataTable<TData, TSubRowData>({
  data,
  columns: rawColumns,
  controls,
  controlsRowClassName,
  columnCustomization,
  showPagination = true,
  loading = false,
  error,
  variant = "default",
  subRowData,
  subRowColumnKeyPath,
  pageSize = DEFAULT_PAGE_SIZE,
  showResetFiltersButton,
  resetTableKey,
  columnKeyPath,
  emptyState,
  onRowClick,
  permanentScrollbar,
  className,
  columnDisplayNames,
  defaultSortingColumn,
  initialColumnVisibility,
  onDownload,
  refetch,
}: Props<TData, TSubRowData>) {
  const history = useHistory()

  const [expandedRows, setExpandedRows] = useState<{ [key: string]: boolean }>({})

  const columns = useMemo(() => {
    if (!subRowData) {
      return rawColumns
    }
    const copied: ExtendedColumnDef<TData, TSubRowData>[] = [...rawColumns]

    copied.unshift({
      id: "expansion",
      enableResizing: false,
      cell: ({ row }) => {
        const rowKey = extractBaseRowKey(row, columnKeyPath)

        return (
          <div
            className={"flex h-full w-full flex-col items-center justify-center"}
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              setExpandedRows((old) => ({ ...old, [rowKey]: !old[rowKey] }))
            }}>
            {expandedRows[rowKey] ? <MinusSquareOutlined /> : <PlusSquareOutlined />}
          </div>
        )
      },
      size: 50,
      maxSize: 50,
    })

    return copied
  }, [rawColumns, subRowData, expandedRows, setExpandedRows, columnKeyPath])

  const isCreatedColumn = useMemo(() => {
    return !!columns.find((column) => column.id === "created")
  }, [columns])

  const defaultSortingState = useMemo(() => {
    const sortingState: SortingState = []

    if (defaultSortingColumn) {
      sortingState.push({ id: defaultSortingColumn, desc: false })
    } else if (isCreatedColumn) {
      sortingState.push({ id: "created", desc: true })
    } else {
      sortingState.push({ id: columns[0]?.id as string, desc: false })
    }

    return sortingState
  }, [isCreatedColumn, defaultSortingColumn, columns])

  const [sorting, setSorting] = useState<SortingState>(defaultSortingState)
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [hoveredRow, setHoveredRow] = useState<string | undefined>(undefined)
  const [hoveredSubRow, setHoveredSubRow] = useState<string | undefined>(undefined)
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  })

  const hasInitiallyLoaded = useRef(false)

  useEffect(() => {
    if (!loading && !hasInitiallyLoaded.current) {
      hasInitiallyLoaded.current = true
    }
  }, [loading])

  const tableRef = useRef<HTMLTableElement>(null)
  const previousResetKeyRef = useRef<string | undefined>(undefined)

  const shouldShowSkeleton =
    loading && !hasInitiallyLoaded.current && (data?.length === 0 || data === undefined)

  const displayColumns = useMemo(() => {
    if (columns.length > 0) return columns
    if (shouldShowSkeleton) return mockColumns

    return columns
  }, [columns, shouldShowSkeleton])

  const table = useReactTable({
    data: data || [],
    columns: displayColumns,
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
    initialState: {
      columnVisibility: initialColumnVisibility,
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
  const { toggleAllRowsSelected } = table

  useEffect(() => {
    function resetTable() {
      if (hasInitiallyLoaded.current) {
        const currentParams = new URLSearchParams(window.location.search)

        if (currentParams.has("search")) {
          currentParams.delete("search")
          history.replace({ search: currentParams.toString() })
        }
      }
      toggleAllRowsSelected(false)
    }
    if (resetTableKey && resetTableKey !== previousResetKeyRef.current) {
      previousResetKeyRef.current = resetTableKey
      resetTable()
    }
  }, [
    defaultSortingState,
    hasInitiallyLoaded,
    history,
    resetTableKey,
    toggleAllRowsSelected,
    previousResetKeyRef,
  ])

  const filteredDataLength = table.getFilteredRowModel().rows.length

  useEffect(() => {
    const totalPages = table.getPageCount()
    const currentPageIndex = table.getState().pagination.pageIndex

    // Only adjust page if current page is beyond available pages
    if (currentPageIndex >= totalPages && totalPages > 0) {
      // Move to the last available page instead of page 0
      table.setPageIndex(totalPages - 1)
    }
  }, [data?.length, filteredDataLength, table])

  const isResizing =
    table.getState().columnSizingInfo.deltaOffset !== undefined &&
    table.getState().columnSizingInfo.deltaOffset !== 0 &&
    table.getState().columnSizingInfo.deltaOffset !== null

  const isLoading = !hasInitiallyLoaded && loading
  const isEmpty = hasInitiallyLoaded && (data?.length === 0 || data === undefined)
  const skeletonColumnCount = displayColumns.length

  const hasError = error && error.val?.message

  const hasActiveFilters = columnFilters.some((filter) => isFilterSet(filter.value as FilterValue))

  const hasFilteredResults =
    hasActiveFilters && data && data.length > 0 && table.getRowModel().rows.length === 0

  const shouldDisableHover = isLoading || isEmpty || hasError || hasFilteredResults

  const shouldTableBeFullWidthMain = shouldTableBeFullWidth || data?.length === 0

  const handleResetFilters = () => {
    const currentParams = new URLSearchParams(window.location.search)
    currentParams.delete("search")
    history.replace({ search: currentParams.toString() })
    table.resetColumnFilters()
  }

  return (
    <div className={cn("rounded-md border", className)}>
      <div className={cn("flex flex-row items-center justify-between", controlsRowClassName)}>
        <div className="flex flex-grow flex-row items-center gap-2">
          {controls(table)}

          {shouldShowResetFiltersButton && (
            <Button variant="ghost" onClick={handleResetFilters}>
              Reset Filters
            </Button>
          )}
        </div>
        <MaybeContainer
          className="flex items-center"
          conditions={[!!refetch, !!columnCustomization, !!onDownload]}>
          {refetch && <RefreshButton onRefresh={refetch} />}
          {columnCustomization && (
            <ColumnCustomization displayNames={columnDisplayNames} table={table} />
          )}
          {onDownload && (
            <Tooltip content="Download as CSV">
              <Button variant="ghost" onClick={() => onDownload(table)} className="ml-2">
                <DownloadOutlined className="*:size-4" />
              </Button>
            </Tooltip>
          )}
        </MaybeContainer>
      </div>
      <Table
        containerClassName={cn("overflow-hidden", {
          "overflow-hidden": (hasFilteredResults || isEmpty) && !permanentScrollbar,
          "hover:overflow-auto": !hasFilteredResults && !isEmpty && !permanentScrollbar,
          "overflow-auto": permanentScrollbar,
        })}
        hasPagination={showPagination && table.getPageCount() > 1}
        ref={tableRef}
        style={{
          width: shouldTableBeFullWidthMain ? "100%" : table.getTotalSize(),
        }}>
        <DataTableHeader
          table={table}
          isResizing={isResizing}
          shouldMenuAppearOnHover={shouldMenuAppearOnHover}
        />
        <TableBody>
          {shouldShowSkeleton ? (
            <DataTableSkeleton columns={skeletonColumnCount} variant={variant} />
          ) : table.getRowModel().rows.length > 0 ? (
            table.getRowModel().rows.map((row) => {
              const key = extractBaseRowKey(row, columnKeyPath)
              const subRows = subRowData?.[key]
              const isBaseRowHovered = hoveredSubRow == null && hoveredRow === row.id

              return (
                <DataTableRowContext.Provider
                  key={key as Key}
                  value={{ isHovered: isBaseRowHovered }}>
                  <DataTableRow
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
                      const shouldFrostCell = shouldMenuAppearOnHover
                      const columnDef = cell.column.columnDef as ExtendedColumnDef<TData>
                      const hideActions = isPinned && !isBaseRowHovered && !shouldMenuAppearOnHover

                      return (
                        <TableCell
                          key={cell.id}
                          variant={variant}
                          data-opacity-transition={
                            isPinned && !isBaseRowHovered && !shouldMenuAppearOnHover
                          }
                          className={cn(
                            "overflow-x-hidden text-ellipsis whitespace-nowrap text-xs text-primary",

                            {
                              "opacity-0": hideActions,
                              "bg-transparent hover:bg-transparent group-hover:bg-transparent":
                                isPinned,
                              "p-0": isPinned,
                            },
                            columnDef.cellClassName
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
                  </DataTableRow>
                  {!!(expandedRows[key] && subRows && subRows.length) &&
                    subRows.map((subRow, i) => {
                      const subRowKey = extractRowKey(
                        subRow,
                        `subrow_${i}`,
                        subRowColumnKeyPath ?? columnKeyPath
                      )

                      const isSubRowHovered = hoveredSubRow === subRowKey && hoveredRow === row.id

                      return (
                        <DataTableRowContext.Provider
                          key={subRowKey}
                          value={{ isHovered: isSubRowHovered }}>
                          <DataTableRow
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.05 }}
                            onMouseOver={() => {
                              setHoveredRow(row.id)
                              setHoveredSubRow(subRowKey)
                            }}
                            onMouseLeave={() => {
                              setHoveredRow(undefined)
                              setHoveredSubRow(undefined)
                            }}
                            className={cn("group/data-table-cell", {
                              "cursor-pointer": !!onRowClick,
                            })}
                            onClick={() => {
                              onRowClick?.(key as Key, row.id, subRowKey)
                            }}
                            data-row-key={subRowKey}>
                            {row.getVisibleCells().map((cell) => {
                              const isPinned = cell.column.getIsPinned()
                              const shouldFrostCell = shouldMenuAppearOnHover

                              const columnDef = cell.column.columnDef as ExtendedColumnDef<TData>

                              const hideActions =
                                isPinned && !isSubRowHovered && !shouldMenuAppearOnHover

                              return (
                                <TableCell
                                  key={cell.id}
                                  variant={variant}
                                  data-opacity-transition={
                                    isPinned && !isSubRowHovered && !shouldMenuAppearOnHover
                                  }
                                  className={cn(
                                    "overflow-x-hidden text-ellipsis whitespace-nowrap text-xs text-primary",

                                    {
                                      "opacity-0": hideActions,
                                      "bg-transparent hover:bg-transparent group-hover:bg-transparent":
                                        isPinned,
                                      "p-0": isPinned,
                                    },
                                    columnDef.cellClassName
                                  )}
                                  style={{
                                    maxWidth: cell.column.getSize(),
                                    ...getCommonPinningStyles(cell.column, shouldMenuAppearOnHover),
                                  }}>
                                  {isPinned ? (
                                    <FrostedCell frostCell={shouldFrostCell}>
                                      {flexRender(columnDef.subRowCell, subRow as any)}
                                    </FrostedCell>
                                  ) : (
                                    flexRender(columnDef.subRowCell, subRow as any)
                                  )}
                                </TableCell>
                              )
                            })}
                          </DataTableRow>
                        </DataTableRowContext.Provider>
                      )
                    })}
                </DataTableRowContext.Provider>
              )
            })
          ) : (
            <TableRow>
              <TableCell
                colSpan={displayColumns.length}
                className={cn(
                  "relative h-24",
                  shouldDisableHover ? "hover:bg-white group-hover:bg-white" : ""
                )}>
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

function DataTableHeader<TData>({
  table,
  isResizing,
  shouldMenuAppearOnHover,
}: {
  table: ReactTable<TData>
  isResizing: boolean
  shouldMenuAppearOnHover: boolean
}) {
  return (
    <TableHeader>
      {table.getHeaderGroups().map((headerGroup) => (
        <TableRow key={headerGroup.id}>
          {headerGroup.headers.map((header) => (
            <DataTableHeaderCell
              key={header.id}
              header={header}
              table={table}
              isResizing={isResizing}
              shouldMenuAppearOnHover={shouldMenuAppearOnHover}
            />
          ))}
        </TableRow>
      ))}
    </TableHeader>
  )
}

function extractBaseRowKey<TData>(row: Row<TData>, columnKeyPath?: string[]) {
  return extractRowKey(row.original, row.id, columnKeyPath)
}

function extractRowKey<TData>(start: TData, fallback: string, columnKeyPath?: string[]) {
  return columnKeyPath
    ? (columnKeyPath.reduce((acc, key) => {
        if (acc === undefined || acc === null) {
          return fallback
        }

        return (acc as Record<string, any>)[key]
      }, start) as string)
    : fallback
}

function DataTableHeaderCell<TData, TValue>({
  header,
  table,
  isResizing,
  shouldMenuAppearOnHover,
}: {
  header: Header<TData, TValue>
  table: ReactTable<TData>
  isResizing: boolean
  shouldMenuAppearOnHover: boolean
}) {
  const size = header.column.getSize()
  const acceptsResizing = header.column.getCanResize()

  const columnDef = header.column.columnDef as ExtendedColumnDef<TData>

  const { sortOnClick } = columnDef

  const headerClick = useCallback(() => {
    if (sortOnClick) {
      header.column.toggleSorting(header.column.getIsSorted() === "asc")
    }
  }, [sortOnClick, header.column])

  return (
    <TableHead
      // react-table sets the position to the header to initial, hence we need to force it.
      className={`!relative select-none ${isResizing ? "cursor-col-resize" : ""}`}
      onClick={headerClick}
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
              table.options.columnResizeMode === "onEnd" && header.column.getIsResizing()
                ? `translateX(${
                    (table.options.columnResizeDirection === "rtl" ? -1 : 1) *
                    (table.getState().columnSizingInfo.deltaOffset ?? 0)
                  }px)`
                : "",
          }}></div>
      )}
    </TableHead>
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
          "absolute left-0 top-[1px] flex h-[calc(100%-1px)] w-full flex-row transition-all"
        )}>
        <div
          className={cn(
            "h-full w-4 flex-shrink-0 from-table-cell-hover/[0%] from-0% to-table-cell-hover/[80%] group-hover:bg-gradient-to-r",
            {
              "bg-table-cell group-hover:bg-table-cell-hover": frostCell,
            }
          )}></div>
        <div
          className={cn(
            "h-full flex-grow from-table-cell-hover/[80%] from-0% via-table-cell-hover via-[30%] to-table-cell-hover group-hover:bg-gradient-to-r",
            {
              "bg-table-cell group-hover:bg-table-cell-hover": frostCell,
            }
          )}></div>
      </div>

      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center gap-2 px-4 py-2.5">
        {children}
      </div>
    </div>
  )
}

export { DataTable }
