import {
  Column,
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Header,
  PaginationState,
  Table as ReactTable,
  Row,
  RowData,
  SortingState,
  TableOptions,
  useReactTable,
} from "@tanstack/react-table"
import { motion } from "framer-motion"
import React, {
  ComponentType,
  CSSProperties,
  forwardRef,
  Key,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react"
import { useHistory } from "react-router-dom"

import { cn } from "../../cn-utils"
import { Button } from "../Button"
import { MaybeContainer } from "../MaybeContainer"
import { TSelectOptionType } from "../Select/types"
import {
  TableRow as NormalTableRow,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from "../Table"
import { Tooltip } from "../Tooltip"
import ColumnCustomization from "./ColumnCustomization"
import { TableNoFilterResults } from "./components/TableNoFilterResults"
import { DataTableContext, DataTableContextValue } from "./DataTableContext"
import { DataTableRowContext } from "./DataTableRowContext"
import { DataTableSkeleton, mockColumns } from "./DataTableSkeleton"
import TablePagination from "./Pagination"
import RefreshButton from "./RefreshButton"
import useMenuVisibility from "./useMenuVisibility"
import { ResultError } from "@loft-enterprise/client"
import { DownloadOutlined, MinusSquareOutlined, PlusSquareOutlined } from "@loft-enterprise/icons"
import { arrStrict, str, useMeasureElementWidth, XOr } from "@loft-enterprise/shared"

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

export type ExtendedColumnDef<TData extends RowData> = ColumnDef<TData> & {
  sortOnClick?: boolean
  cellClassName?: string
}

export type CustomRowContextProps<TData extends RowData> = {
  row: Row<TData>
  children: React.ReactNode
}

export type CustomRowContext<TData extends RowData> = ComponentType<CustomRowContextProps<TData>>

export type ExpansionComponentProps<TData extends RowData> = {
  row: Row<TData>
}

export type ExpansionComponent<TData extends RowData> = ComponentType<
  ExpansionComponentProps<TData>
>

export type DataTableHandle = {
  expandRow: (key: string) => void
  collapseRow: (key: string) => void
  toggleRow: (key: string) => void
  getExpandedRows: () => { [key: string]: boolean }
}

type Props<TData> = {
  data: TData[] | undefined
  className?: string
  variant?: "default" | "slim"
  customRowContextProvider?: CustomRowContext<TData>
  controlsRowClassName?: string
  columns: ExtendedColumnDef<TData>[]
  controls?: (table: ReactTable<TData>) => React.ReactNode
  rightControls?: React.ReactNode
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
  onRowClick?: (rowKey: Key, rowId: string, subRowKey?: Key, subRowId?: string) => void
  emptyState?: React.ReactNode
  columnDisplayNames?: Record<string, string>
  initialColumnVisibility?: Record<string, boolean>
  onDownload?: (table: ReactTable<TData>) => void
  refetch?: () => void | Promise<void>
  renderExpandedContent?: (row: TData) => React.ReactNode
  expandedRowKeys?: Set<string>
  onToggleExpanded?: (rowKey: string) => void
} & XOr<
  {
    // Enforce either both or none are set.
    subRowData: { [key: string]: TData[] }
    isSubRow: (data: TData) => boolean
  },
  {
    expansionComponent?: ExpansionComponent<TData>
  }
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

function DataTableInner<TData>(
  {
    data,
    columns: rawColumns,
    controls,
    rightControls,
    controlsRowClassName,
    columnCustomization,
    showPagination = true,
    loading = false,
    error,
    variant = "default",
    subRowData,
    pageSize = DEFAULT_PAGE_SIZE,
    showResetFiltersButton,
    resetTableKey,
    columnKeyPath,
    emptyState,
    onRowClick,
    customRowContextProvider: CustomRowContextProvider,
    permanentScrollbar,
    className,
    columnDisplayNames,
    isSubRow,
    defaultSortingColumn,
    initialColumnVisibility,
    onDownload,
    refetch,
    expansionComponent: ExpansionComponent,
    renderExpandedContent,
    expandedRowKeys,
    onToggleExpanded,
  }: Props<TData>,
  ref: React.Ref<DataTableHandle>
) {
  const history = useHistory()

  const { expandedRows, expandRow, collapseRow, toggleRow, getExpandedRows, setExpandedRows } =
    useExpandedRows()

  useImperativeHandle(
    ref,
    () => ({
      expandRow,
      collapseRow,
      toggleRow,
      getExpandedRows,
    }),
    [expandRow, collapseRow, toggleRow, getExpandedRows]
  )

  const columns = useMemo(() => {
    if (!subRowData) {
      return rawColumns
    }
    const copied: ExtendedColumnDef<TData>[] = [...rawColumns]

    copied.unshift({
      id: "expansion",
      enableResizing: false,
      cell: ({ row }) => {
        if (row.depth !== 0) {
          return null
        }

        return (
          <div
            className={"flex h-full w-full select-none flex-col items-center justify-center"}
            onClick={(e) => {
              e.stopPropagation()
              row.toggleExpanded()
            }}>
            {row.getIsExpanded() ? <MinusSquareOutlined /> : <PlusSquareOutlined />}
          </div>
        )
      },
      size: 50,
      maxSize: 50,
    })

    return copied
  }, [rawColumns, subRowData])

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

  const tableWidth = useMeasureElementWidth(tableRef)

  const shouldShowSkeleton =
    loading && !hasInitiallyLoaded.current && (data?.length === 0 || data === undefined)

  const displayColumns = useMemo(() => {
    if (columns.length > 0) return columns
    if (shouldShowSkeleton) return mockColumns

    return columns
  }, [columns, shouldShowSkeleton])

  const reactTableDefinition: TableOptions<TData> = {
    data: arrStrict(data),
    columns: displayColumns,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getSubRows: (row) => {
      if (ExpansionComponent) {
        return undefined
      }

      if (!subRowData || !columnKeyPath) {
        return undefined
      }

      if (isSubRow(row)) {
        return undefined
      }

      const key = extractRowKey(row, columnKeyPath)

      if (!key) {
        return undefined
      }

      return arrStrict(subRowData[key])
    },
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    paginateExpandedRows: false,
    enableMultiRowSelection: true,
    autoResetPageIndex: false,
    autoResetExpanded: false,
    onExpandedChange: (updaterOrValue) => {
      const newExpandedState =
        typeof updaterOrValue === "function" ? updaterOrValue(expandedRows) : updaterOrValue

      // We don't support wildcard expansion at this moment.
      // Would only happen when table.toggleAllRowsExpanded is called.
      if (typeof newExpandedState !== "boolean") {
        setExpandedRows(newExpandedState)
      }
    },
    columnResizeMode: "onChange",
    columnResizeDirection: "ltr",
    defaultColumn: {
      minSize: 90,
    },
    state: {
      pagination,
      sorting,
      expanded: expandedRows,
      columnFilters,
      columnPinning: {
        right: ["actions"],
      },
    },
    initialState: {
      columnVisibility: initialColumnVisibility,
    },
  }

  if (columnKeyPath) {
    // TODO: Build in functionality for namespace + name tuple and make this the default.
    reactTableDefinition.getRowId = (originalRow, index) => {
      const key = extractRowKey(originalRow, columnKeyPath)

      if (!key) {
        return str(index)
      }

      return key
    }
  }

  const table = useReactTable(reactTableDefinition)

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

  const tableContextValue: DataTableContextValue = useMemo(
    () => ({
      tableRef,
    }),
    [tableRef]
  )

  const shouldShowControls =
    !!controls ||
    !!shouldShowResetFiltersButton ||
    !!rightControls ||
    !!refetch ||
    !!columnCustomization ||
    !!onDownload

  return (
    <div className={cn("rounded-md border", className)}>
      {shouldShowControls && (
        <>
          <div
            className={cn("mb-4 flex flex-row items-center justify-between", controlsRowClassName)}>
            {(!!controls || !!shouldShowResetFiltersButton) && (
              <div className="flex flex-grow flex-row items-center gap-2">
                {controls && controls(table)}

                {shouldShowResetFiltersButton && (
                  <Button variant="ghost" onClick={handleResetFilters}>
                    Reset Filters
                  </Button>
                )}
              </div>
            )}
            <MaybeContainer
              className="flex flex-row items-center gap-2"
              conditions={[!!rightControls, !!refetch, !!columnCustomization, !!onDownload]}>
              {rightControls}
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
        </>
      )}
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
        <DataTableContext.Provider value={tableContextValue}>
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
                const isRowHovered = hoveredRow === row.id
                const hasExpansionComponent = !!(expandedRows[key] && ExpansionComponent)
                const isExpanded = expandedRowKeys?.has(key as string) ?? false

                const handleRowClick = () => {
                  const parentRow = row.getParentRow()
                  if (parentRow != null) {
                    const parentKey = extractBaseRowKey(parentRow, columnKeyPath)
                    onRowClick?.(parentKey as Key, parentRow.id, key as Key, row.id)
                    return
                  }

                  if (onToggleExpanded && renderExpandedContent) {
                    onToggleExpanded(key as string)
                  } else {
                    onRowClick?.(key as Key, row.id)
                  }
                }

                const content = (
                  <DataTableRowContext.Provider value={{ isHovered: isRowHovered }}>
                    <DataTableRow
                      className={cn({
                        "cursor-pointer": !!onRowClick || !!onToggleExpanded,
                      })}
                      onClick={handleRowClick}
                      data-row-key={key as Key}
                      data-state={row.getIsSelected() && "selected"}
                      onMouseOver={() => setHoveredRow(row.id)}
                      onMouseLeave={() => setHoveredRow(undefined)}>
                      {row.getVisibleCells().map((cell) => {
                        const isPinned = cell.column.getIsPinned()
                        const shouldFrostCell = shouldMenuAppearOnHover
                        const columnDef = cell.column.columnDef as ExtendedColumnDef<TData>
                        const hideActions = isPinned && !isRowHovered && !shouldMenuAppearOnHover

                        return (
                          <TableCell
                            key={cell.id}
                            variant={variant}
                            data-column-key={cell.column.id}
                            data-opacity-transition={
                              isPinned && !isRowHovered && !shouldMenuAppearOnHover
                            }
                            className={cn(
                              "overflow-x-hidden text-ellipsis whitespace-nowrap text-xs text-primary",

                              {
                                "border-b-none !rounded-b-none border-b-0": hasExpansionComponent,
                                "bg-table-cell-hover": hoveredRow === row.id,
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
                            }}
                            onClick={(e) => {
                              if (isPinned) {
                                e.stopPropagation()
                              }
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
                    {hasExpansionComponent && (
                      <tr>
                        <td
                          colSpan={displayColumns.length}
                          className="relative !rounded-none bg-white p-0">
                          <div
                            onMouseOver={() => setHoveredRow(row.id)}
                            onMouseLeave={() => setHoveredRow(undefined)}
                            className={cn(
                              "sticky left-0 top-0 h-fit gap-2 border-b border-b-divider-main bg-white hover:bg-table-cell-hover",
                              {
                                "bg-table-cell-hover": hoveredRow === row.id,
                              }
                            )}
                            style={{ width: tableWidth - 2 }}>
                            <ExpansionComponent row={row} />
                          </div>
                        </td>
                      </tr>
                    )}
                    {isExpanded && renderExpandedContent && (
                      <TableRow>
                        <TableCell
                          colSpan={displayColumns.length}
                          className="border-b bg-white p-0 hover:bg-white group-hover:bg-white">
                          {renderExpandedContent(row.original)}
                        </TableCell>
                      </TableRow>
                    )}
                  </DataTableRowContext.Provider>
                )

                return CustomRowContextProvider ? (
                  <CustomRowContextProvider key={key as Key} row={row}>
                    {content}
                  </CustomRowContextProvider>
                ) : (
                  <React.Fragment key={key as Key}>{content}</React.Fragment>
                )
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={displayColumns.length}
                  className={cn(
                    "relative h-24 px-0",
                    shouldDisableHover ? "hover:bg-white group-hover:bg-white" : ""
                  )}>
                  {isEmpty ? (
                    <div style={{ maxWidth: tableWidth }} className="px-4">
                      {emptyState || (
                        <div className="flex w-full flex-row items-center justify-center">
                          No data
                        </div>
                      )}
                    </div>
                  ) : null}

                  {hasError ? (
                    <span className="bg-danger-extra-light p-2 text-danger-main">
                      {error.val.message}
                    </span>
                  ) : null}

                  {hasFilteredResults && (
                    <TableNoFilterResults maxWidth={tableWidth} table={table} />
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </DataTableContext.Provider>
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

export const DataTable = forwardRef(DataTableInner) as <TData>(
  props: Props<TData> & { ref?: React.Ref<DataTableHandle> }
) => React.ReactElement

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
  return extractRowKey(row.original, columnKeyPath) ?? row.id
}

function extractRowKey<TData>(start: TData, columnKeyPath?: string[]) {
  return columnKeyPath
    ? (columnKeyPath.reduce((acc, key) => {
        if (acc === undefined || acc === null) {
          return undefined
        }

        return (acc as Record<string, any>)[key]
      }, start) as string | undefined)
    : undefined
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
      scope="col"
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
              ? "isResizing bg-neutral-dark"
              : "bg-transparent hover:bg-neutral-dark"
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

function useExpandedRows() {
  const [expandedRows, setExpandedRows] = useState<{ [key: string]: boolean }>({})

  const expandRow = useCallback((key: string) => {
    setExpandedRows((old) => {
      if (old[key]) {
        return old
      }

      return { ...old, [key]: true }
    })
  }, [])

  const collapseRow = useCallback((key: string) => {
    setExpandedRows((old) => {
      if (!old[key]) {
        return old
      }

      const newState = { ...old }
      delete newState[key]

      return newState
    })
  }, [])

  const toggleRow = useCallback((key: string) => {
    setExpandedRows((old) => ({ ...old, [key]: !old[key] }))
  }, [])

  const getExpandedRows = useCallback(() => expandedRows, [expandedRows])

  return { expandedRows, expandRow, collapseRow, toggleRow, getExpandedRows, setExpandedRows }
}
