import cn from "clsx"
import React, { useEffect, useState } from "react"
import {
  DateRange,
  DayPicker,
  DayPickerProps,
  getDefaultClassNames,
  PropsBase,
} from "react-day-picker"

import { Button } from "./Button"

export type TDateRange = DateRange

// Add simple props for the done button
type DateRangePickerCustomProps = {
  showConfirmButton?: boolean
  confirmButtonText?: string
  onConfirm?: (date: DateRange | Date | undefined) => void
  selected?: DateRange | Date | undefined
  mode?: "single" | "range"
  onSelect?: (date: DateRange | Date | undefined) => void
  rootClassName?: string
}

type DateRangePickerProps = Omit<DayPickerProps, "selected" | "mode"> &
  PropsBase &
  DateRangePickerCustomProps

export function DateRangePicker({
  mode = "range",
  selected,
  showConfirmButton,
  confirmButtonText = "Done",
  onConfirm,
  onSelect,
  rootClassName,
  ...rest
}: DateRangePickerProps) {
  const [tempSelected, setTempSelected] = useState<Date | DateRange | undefined>(selected)

  useEffect(() => {
    setTempSelected(selected)
  }, [selected])

  const handleSelect = (date: Date | DateRange | undefined) => {
    setTempSelected(date)
    if (onSelect) {
      onSelect(date)
    }
  }

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm(tempSelected)
    }
  }

  const defaultClassNames = getDefaultClassNames()

  const dayPickerProps = {
    ...rest,
    mode,
    selected: mode === "range" ? (tempSelected as DateRange) : (tempSelected as Date),
    onSelect: handleSelect,
  } as unknown as DayPickerProps

  return (
    <div className="date-range-picker-wrapper">
      <DayPicker
        {...dayPickerProps}
        components={{}}
        classNames={{
          ...defaultClassNames,
          months: `flex flex-row-reverse gap-2`,
          month_caption:
            "text-center font-semibold text-sm border-b border-neutral-light py-3 px-8",
          today: `border border-primary-main`,
          selected: `[&:not(.rdp-day_range_start):not(.rdp-day_range_end)]:text-white`,
          root: cn(defaultClassNames.root, "shadow-lg bg-white relative", rootClassName),
          button_next:
            "absolute right-2 top-2 p-2 *:size-4 group disabled:bg-disabled-light flex items-center justify-center",
          chevron: "group-disabled:stroke-disabled-light",
          button_previous:
            "absolute left-2 top-2 p-2 *:size-4 group disabled:bg-disabled-light flex items-center justify-center",
          disabled: "text-disabled-main",
          weekdays: "font-normal text-sm text-primary",
          weekday: "font-normal pt-2 select-none",
          outside: "text-disabled-main",
          range_start: "bg-primary-main",
          range_end: "bg-primary-main",
          range_middle: "bg-neutral-light !text-primary",
          day_button: "px-2 py-1 text-sm text-center disabled:text-disabled-main",
          day: "text-center",
          day_disabled: "text-disabled-main",
          month_grid: "px-3 block pb-2",
        }}
      />

      {showConfirmButton && (
        <div className="flex justify-end gap-4 border-t border-divider-main px-2 py-3">
          <Button
            variant="outlined"
            appearance="neutral"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handleConfirm()
            }}>
            Cancel
          </Button>
          <Button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handleConfirm()
            }}>
            {confirmButtonText}
          </Button>
        </div>
      )}
    </div>
  )
}
