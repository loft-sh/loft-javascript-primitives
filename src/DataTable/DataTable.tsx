import { Column, flexRender, Header, Table as ReactTable, Row } from "@tanstack/react-table"
import React, { CSSProperties, useMemo, useRef, useState } from "react"

import { cn } from "../../cn-utils"
import { Alert } from "../Alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../Table"
import { DataTableContext, DataTableContextValue } from "./DataTableContext"
import { DataTableRow } from "./DataTableRow"
import { DataTableRowContext } from "./DataTableRowContext"
import { DataTableSkeleton } from "./DataTableSkeleton"
import { useAutoFitPageSize } from "./hooks/useAutoFitPageSize"
import TablePagination from "./Pagination"
import type { CustomRowContext, ExpansionComponent, ExtendedColumnDef } from "./types"
import useMenuVisibility from "./useMenuVisibility"
import { ResultError } from "@loft-enterprise/client"
import { useMeasureElementWidth } from "@loft-enterprise/shared"

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 25, 50]
const INTERACTIVE_ELEMENTS = "a, button, input, label, select, textarea, [role='menuitem']"

function getCommonPinningStyles<TData>(
  column: Column<TData>,
  shouldMenuAppearOnHover: boolean,
  isHeader?: boolean
): CSSProperties {
  const isPinned = column.getIsPinned()
  const isActions = column.id === "actions"

  return {
    left: isPinned === "left" ? `${column.getStart("left")}px` : undefined,
    right: isPinned === "right" ? `${column.getAfter("right")}px` : undefined,
    position:
      isPinned && !(isActions && (isHeader || shouldMenuAppearOnHover)) ? "sticky" : "relative",
    zIndex: isPinned ? (isHeader ? 2 : 1) : undefined,
    width: column.getSize(),
  }
}

export type DataTableProps<T> = {
  table: ReactTable<T>
  loading?: boolean
  error?: ResultError
  emptyState?: React.ReactNode
  customRowContextProvider?: CustomRowContext<T>
  expansionComponent?: ExpansionComponent<T>
  onRowClick?: (row: Row<T>) => void
  className?: string
  variant?: "default" | "slim"
  autoFitPageSize?: boolean
  permanentScrollbar?: boolean
}

export function DataTable<TData>({
  table,
  loading = false,
  error,
  emptyState,
  customRowContextProvider: CustomRowContextProvider,
  expansionComponent: ExpansionComponent,
  onRowClick,
  className,
  variant = "default",
  autoFitPageSize = false,
  permanentScrollbar = false,
}: DataTableProps<TData>) {
  const tableRef = useRef<HTMLTableElement>(null)
  const firstRowRef = useRef<HTMLTableRowElement>(null)
  const headerRef = useRef<HTMLTableSectionElement>(null)
  const [hoveredRow, setHoveredRow] = useState<string>()
  const [openActionMenuRow, setOpenActionMenuRow] = useState<string>()
  const tableWidth = useMeasureElementWidth(tableRef)
  const { shouldMenuAppearOnHover, shouldTableBeFullWidth } = useMenuVisibility({ tableRef, table })
  const pagination = table.getState().pagination
  const [isPageSizePicked, setIsPageSizePicked] = useState(false)
  useAutoFitPageSize({
    enabled: autoFitPageSize && !isPageSizePicked,
    tableRef,
    variant,
    onFit: table.setPageSize,
    rowCount: table.options.data.length,
    rowRef: firstRowRef,
    headerRef,
  })
  const handlePageSizeChange = (size: number) => {
    setIsPageSizePicked(true)
    table.setPagination({ pageIndex: 0, pageSize: size })
  }
  const displayColumns = table.getVisibleLeafColumns()
  const totalRowCount = table.getCoreRowModel().rows.length
  const shouldShowSkeleton = loading && totalRowCount === 0
  const skeletonColumnCount = displayColumns.length
  // With cached rows the error shows above the table, so the body keeps its empty state.
  const bodyError = totalRowCount === 0 ? error?.val?.message : undefined
  const isEmpty = !loading && !bodyError && table.getRowModel().rows.length === 0
  const shouldDisableHover = shouldShowSkeleton || isEmpty || !!error?.val?.message
  const shouldTableBeFullWidthMain = shouldTableBeFullWidth || isEmpty
  const isResizing = !!table.getState().columnSizingInfo.isResizingColumn
  const shouldShowPagination =
    table.getPrePaginationRowModel().rows.length >
    Math.min(pagination.pageSize, ...DEFAULT_PAGE_SIZE_OPTIONS)
  const tableContextValue: DataTableContextValue = useMemo(() => ({ tableRef }), [])

  return (
    <div className={cn("rounded-md border", className)}>
      {error?.val?.message && totalRowCount > 0 && (
        <Alert variant="danger" className="rounded-none border-x-0 border-t-0">
          {error.val.message}
        </Alert>
      )}
      <Table
        aria-busy={loading}
        containerClassName={cn("overflow-auto", {
          "overflow-hidden": isEmpty && !permanentScrollbar,
        })}
        hasPagination={shouldShowPagination}
        ref={tableRef}
        style={{
          width: shouldTableBeFullWidthMain ? "100%" : table.getTotalSize(),
        }}>
        <DataTableContext.Provider value={tableContextValue}>
          <DataTableHeader
            headerRef={headerRef}
            table={table}
            isResizing={isResizing}
            shouldMenuAppearOnHover={shouldMenuAppearOnHover}
          />
          <TableBody>
            {shouldShowSkeleton ? (
              <DataTableSkeleton columns={skeletonColumnCount} variant={variant} />
            ) : table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row, index) => {
                const isRowHovered = hoveredRow === row.id
                const isActionMenuOpen = openActionMenuRow === row.id
                const shouldShowRowActions = isRowHovered || isActionMenuOpen
                const hasExpansionComponent = !!(row.getIsExpanded() && ExpansionComponent)

                const content = (
                  <DataTableRowContext.Provider
                    value={{
                      isHovered: shouldShowRowActions,
                      isActionMenuOpen,
                      setActionMenuOpen: (open) => {
                        setOpenActionMenuRow((currentOpenRow) => {
                          if (open) {
                            return row.id
                          }

                          return currentOpenRow === row.id ? undefined : currentOpenRow
                        })
                      },
                    }}>
                    <DataTableRow
                      ref={index === 0 ? firstRowRef : undefined}
                      className={cn({
                        "cursor-pointer": !!onRowClick,
                      })}
                      onClick={({ target, currentTarget }) => {
                        // Controls in the row, and the menus they open in a portal, keep their clicks.
                        if (
                          target instanceof Element &&
                          currentTarget.contains(target) &&
                          !currentTarget.contains(target.closest(INTERACTIVE_ELEMENTS))
                        ) {
                          onRowClick?.(row)
                        }
                      }}
                      data-row-key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      onMouseOver={() => setHoveredRow(row.id)}
                      onMouseLeave={() => setHoveredRow(undefined)}
                      onFocus={() => setHoveredRow(row.id)}
                      onBlur={(event) => {
                        if (!event.currentTarget.contains(event.relatedTarget))
                          setHoveredRow(undefined)
                      }}>
                      {row.getVisibleCells().map((cell) => {
                        const isPinned = cell.column.getIsPinned()
                        const shouldFrostCell = shouldMenuAppearOnHover
                        const columnDef = cell.column.columnDef as ExtendedColumnDef<TData>
                        const isActions = cell.column.id === "actions"
                        const hideActions =
                          isActions && isPinned && !shouldShowRowActions && !shouldMenuAppearOnHover

                        return (
                          <TableCell
                            key={cell.id}
                            variant={variant}
                            data-column-key={cell.column.id}
                            data-opacity-transition={
                              isActions && isPinned && !isRowHovered && !shouldMenuAppearOnHover
                            }
                            className={cn(
                              "overflow-x-hidden text-ellipsis whitespace-nowrap text-xs text-primary",

                              {
                                "border-b-none !rounded-b-none border-b-0": hasExpansionComponent,
                                "bg-table-cell-hover": shouldShowRowActions,
                                "opacity-0": hideActions,
                                "bg-transparent hover:bg-transparent group-hover:bg-transparent":
                                  isActions,
                                "p-0": isActions,
                              },
                              columnDef.cellClassName
                            )}
                            style={{
                              maxWidth: cell.column.getSize(),
                              ...getCommonPinningStyles(cell.column, shouldMenuAppearOnHover),
                            }}>
                            {isActions ? (
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
                  </DataTableRowContext.Provider>
                )

                return CustomRowContextProvider ? (
                  <CustomRowContextProvider key={row.id} row={row}>
                    {content}
                  </CustomRowContextProvider>
                ) : (
                  <React.Fragment key={row.id}>{content}</React.Fragment>
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

                  {bodyError ? (
                    <Alert variant="danger" className="m-2">
                      {bodyError}
                    </Alert>
                  ) : null}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </DataTableContext.Provider>
      </Table>
      {shouldShowPagination && (
        <TablePagination
          table={table}
          pageIndex={pagination.pageIndex}
          pageSize={pagination.pageSize}
          pageCount={table.getPageCount()}
          totalItems={table.getFilteredRowModel().rows.length}
          pageSizeOptions={DEFAULT_PAGE_SIZE_OPTIONS}
          showItemCount
          onPageSizeChange={handlePageSizeChange}
          autoFitValue={autoFitPageSize && !isPageSizePicked ? pagination.pageSize : null}
        />
      )}
    </div>
  )
}
function DataTableHeader<TData>({
  table,
  isResizing,
  shouldMenuAppearOnHover,
  headerRef,
}: {
  table: ReactTable<TData>
  isResizing: boolean
  shouldMenuAppearOnHover: boolean
  headerRef: React.RefObject<HTMLTableSectionElement>
}) {
  return (
    <TableHeader ref={headerRef}>
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

  return (
    <TableHead
      className={`select-none ${isResizing ? "cursor-col-resize" : ""}`}
      scope="col"
      aria-sort={
        header.column.getIsSorted() === "asc"
          ? "ascending"
          : header.column.getIsSorted() === "desc"
            ? "descending"
            : undefined
      }
      style={{
        maxWidth: size,
        whiteSpace: "nowrap",
        width: header.getSize(),
        ...getCommonPinningStyles(header.column, shouldMenuAppearOnHover, true),
      }}>
      {header.isPlaceholder ? null : sortOnClick ? (
        <button
          type="button"
          onClick={() => header.column.toggleSorting(header.column.getIsSorted() === "asc")}>
          {flexRender(header.column.columnDef.header, header.getContext())}
        </button>
      ) : (
        flexRender(header.column.columnDef.header, header.getContext())
      )}
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
