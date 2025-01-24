import React from "react"
import { DateRange, DayPicker, DayPickerProps, getDefaultClassNames } from "react-day-picker"

export type TDateRange = DateRange

export function DateRangePicker(props: DayPickerProps) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      {...props}
      components={{}}
      classNames={{
        ...defaultClassNames,
        months: `flex flex-row-reverse gap-2`,
        month_caption: "text-center font-semibold text-sm border-b border-neutral-light py-3 px-8",
        today: `border border-primary-main`,
        selected: `[&:not(.rdp-day_range_start):not(.rdp-day_range_end)]:text-white`,
        root: `${defaultClassNames.root} shadow-lg bg-white relative`,
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
  )
}
