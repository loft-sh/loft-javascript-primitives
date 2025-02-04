import { Column, SortDirection } from "@tanstack/react-table"
import React from "react"

import { ArrowDownOutlined } from "@loft-enterprise/icons"

type TColumnHeader = {
  children: React.ReactNode
  column: Column<any, unknown>
  sortable?: boolean
}

const ColumnHeader = ({ children, column, sortable = false }: TColumnHeader) => {
  const isSorted = column.getIsSorted()

  const handleClick = () => {
    if (sortable) {
      column.toggleSorting(column.getIsSorted() === "asc")
    }

    return
  }

  return (
    <span
      role="button"
      className="flex cursor-pointer select-none items-center gap-2"
      onClick={handleClick}>
      {children}
      {sortable && isSorted && <ColumnHeaderSortableIcon isSorted={isSorted} />}
    </span>
  )
}

const ColumnHeaderSortableIcon = ({ isSorted }: { isSorted: SortDirection }) => {
  return (
    <ArrowDownOutlined
      className={`size-2.5 transition-transform ${isSorted === "asc" ? "rotate-180" : "rotate-0"}`}
    />
  )
}

export { ColumnHeader }
