import RightOutlined from "@ant-design/icons/RightOutlined"
import { Table } from "@tanstack/react-table"
import React, { type ReactNode } from "react"

import { Button } from "../Button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../Select/Select"
import { Tooltip } from "../Tooltip"
import { LeftOutlined } from "@loft-enterprise/icons"
import { str } from "@loft-enterprise/shared"

type Props<TData> = {
  table: Table<TData>
  pageCount: number
  pageIndex: number
  pageSize: number
  totalItems: number
  pageSizeOptions: number[]
  showItemCount: boolean
  onPageSizeChange: (pageSize: number) => void
}

const navButtonClass =
  "h-8 w-8 rounded border p-0 transition-all duration-150 hover:scale-105 hover:shadow-sm active:scale-95 disabled:hover:scale-100 disabled:hover:shadow-none"

function TablePagination<TData>({
  table,
  pageCount,
  pageIndex,
  pageSize,
  totalItems,
  pageSizeOptions,
  showItemCount,
  onPageSizeChange,
}: Props<TData>) {
  const firstItem = pageIndex * pageSize + 1
  const lastItem = Math.min(pageIndex * pageSize + pageSize, totalItems)

  const renderPageButtons = () => {
    const buttons: ReactNode[] = []

    for (let i = 0; i < pageCount; i++) {
      const isFirstOrLast = i === 0 || i === pageCount - 1
      const isNearCurrent = i >= pageIndex - 1 && i <= pageIndex + 1

      if (isFirstOrLast || isNearCurrent) {
        const isCurrentPage = pageIndex === i
        buttons.push(
          <Button
            key={i}
            appearance="neutral"
            variant={isCurrentPage ? "outlined" : "ghost"}
            className={`h-8 min-w-8 rounded border px-3 transition-all duration-150 magic-[disabled]:opacity-100 magic-[disabled]:shadow-transparent ${
              isCurrentPage
                ? "border-primary bg-primary-extra-light font-medium text-primary"
                : "hover:shadow-sm text-primary hover:scale-105 active:scale-95"
            }`}
            onClick={() => table.setPageIndex(i)}
            disabled={isCurrentPage}>
            {i + 1}
          </Button>
        )
      } else if (i === 1 && pageIndex > 2) {
        buttons.push(
          <span
            key="ellipsis-start"
            className="flex h-8 min-w-8 items-center justify-center text-neutral-dark">
            ...
          </span>
        )
      } else if (i === pageCount - 2 && pageIndex < pageCount - 3) {
        buttons.push(
          <span
            key="ellipsis-end"
            className="flex h-8 min-w-8 items-center justify-center text-neutral-dark">
            ...
          </span>
        )
      }
    }

    return buttons
  }

  return (
    <div className="flex w-full rounded rounded-t-none border border-t-0 border-divider-main bg-white px-4 py-2">
      <div className="flex w-full items-center justify-between gap-2 py-4">
        <div className="flex items-center gap-4">
          {showItemCount && totalItems > 0 && (
            <span className="text-sm tabular-nums text-neutral-dark">
              Showing {firstItem}–{lastItem} of {totalItems}
            </span>
          )}
          {pageSizeOptions.length > 1 && (
            <Select value={str(pageSize)} onValueChange={(val) => onPageSizeChange(Number(val))}>
              <SelectTrigger className="h-8 w-[130px]" inputSize="small">
                <SelectValue>{pageSize} per page</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={str(size)}>
                    {size} per page
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Tooltip content="Previous page" wrappingTriggerDiv={false}>
            <Button
              onClick={() => table.previousPage()}
              disabled={pageIndex === 0}
              variant={pageIndex === 0 ? "ghost" : "outlined"}
              className={navButtonClass}
              appearance="neutral">
              <LeftOutlined />
            </Button>
          </Tooltip>

          {renderPageButtons()}

          <Tooltip content="Next page" wrappingTriggerDiv={false}>
            <Button
              appearance="neutral"
              className={navButtonClass}
              onClick={() => table.nextPage()}
              variant={pageIndex === pageCount - 1 ? "ghost" : "outlined"}
              disabled={pageIndex === pageCount - 1}>
              <RightOutlined />
            </Button>
          </Tooltip>
        </div>
      </div>
    </div>
  )
}

export default TablePagination
