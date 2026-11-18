import React, { useState } from "react"

import { DateRangePicker, TDateRange } from "../../DateRangePicker"
import { parseDateRange } from "./definitions"

export function DateRangeMenu({
  value,
  onChange,
}: {
  value: readonly string[]
  onChange: (value: string[]) => void
}) {
  // The picker can report a range without an end. The filter changes only when both ends are set.
  const [range, setRange] = useState<TDateRange | undefined>(() => parseDateRange(value))

  return (
    <DateRangePicker
      rootClassName="shadow-transparent"
      mode="range"
      numberOfMonths={1}
      required
      selected={range}
      onSelect={(selected) => {
        if (selected instanceof Date) return
        setRange(selected)
        if (selected?.from && selected.to) {
          onChange([selected.from.toISOString(), selected.to.toISOString()])
        }
      }}
    />
  )
}
