import { Table } from "@tanstack/react-table"
import React from "react"
import { useHistory } from "react-router-dom"

import { Button } from "../../Button"
import noItemsDueToFilter from "../../images/no-items-due-to-filter.png?url"

type Props<TData> = {
  table: Table<TData>
  maxWidth?: number
}

function TableNoFilterResults<TData>({ table, maxWidth }: Props<TData>) {
  const history = useHistory()
  const handleResetFilters = () => {
    table.resetColumnFilters()
    history.push({ search: "" })
  }

  return (
    <div style={{ maxWidth }} className="flex flex-col items-center justify-center gap-2 py-6">
      <div className="flex flex-col items-center justify-center gap-1 text-sm text-primary">
        <img src={noItemsDueToFilter} alt="No items due to filter" />
        <span className="font-semibold">No results match your filters</span>
        <span>Try adjusting your filters to see more results.</span>
      </div>
      <Button onClick={handleResetFilters}>Reset filters</Button>
    </div>
  )
}

export default TableNoFilterResults
