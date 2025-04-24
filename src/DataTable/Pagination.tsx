import RightOutlined from "@ant-design/icons/RightOutlined"
import { Table } from "@tanstack/react-table"
import React from "react"

import { Button } from "@loft-enterprise/primitives"

type Props<TData> = {
  table: Table<TData>
  tableSize: number
  pageCount: number
  pageIndex: number
}

function TablePagination<TData>({ table, tableSize, pageCount, pageIndex }: Props<TData>) {
  if (pageCount <= 1) {
    return null
  }

  return (
    <div
      key={tableSize}
      className="flex w-full rounded rounded-t-none border border-t-0   border-divider-main bg-white px-2 py-2">
      <div className="relative flex w-full items-center justify-end gap-2 py-4">
        <div className="absolute right-0 flex items-center gap-2"></div>
        <Button
          onClick={() => table.previousPage()}
          disabled={pageIndex === 0}
          className="h-full px-2"
          variant="outlined">
          <RightOutlined className="rotate-180 transform" />
        </Button>
        {Array.from({ length: pageCount }, (_, i) => {
          if (i === 0 || i === pageCount - 1 || (i >= pageIndex - 1 && i <= pageIndex + 1)) {
            return (
              <Button
                key={i}
                variant={pageIndex === i ? "filled" : "ghost"}
                className="rounded border px-3 text-primary disabled:border-primary-dark disabled:bg-primary-extra-light disabled:text-primaryColor-main"
                onClick={() => table.setPageIndex(i)}
                disabled={pageIndex === i}>
                {i + 1}
              </Button>
            )
          } else if (i === 1 && pageIndex > 2) {
            return (
              <span key={i} className="rounded border p-1">
                {"..."}
              </span>
            )
          } else if (i === pageCount - 2 && pageIndex < pageCount - 3) {
            return (
              <span key={i} className="rounded border p-1">
                {"..."}
              </span>
            )
          }

          return null
        })}
        <Button
          className="h-full px-2"
          onClick={() => table.nextPage()}
          variant="outlined"
          disabled={pageIndex === pageCount - 1}>
          <RightOutlined />
        </Button>
      </div>
    </div>
  )
}

export default TablePagination
