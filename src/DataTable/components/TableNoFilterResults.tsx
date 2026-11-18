import React from "react"

import { Button } from "../../Button"
import noItemsDueToFilter from "../../images/no-items-due-to-filter.png?url"

type Props = {
  onResetRequested: () => void
}

export function TableNoFilterResults({ onResetRequested }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-4 py-6">
      <div className="flex flex-col items-center justify-center gap-1 text-sm text-primary">
        <img src={noItemsDueToFilter} alt="No items due to filter" />
        <span className="font-semibold">No results match your filters</span>
        <span>Try adjusting your filters to see more results.</span>
      </div>
      <Button onClick={onResetRequested}>Reset Filters</Button>
    </div>
  )
}
