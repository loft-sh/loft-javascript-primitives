import React, { useCallback, useEffect, useMemo, useState } from "react"
import {
  DateRange,
  DayPicker,
  DayPickerProps,
  getDefaultClassNames,
  PropsBase,
} from "react-day-picker"

import { cn } from "../cn-utils"
import { Button, ButtonProps } from "./Button"
import { Popover, PopoverTrigger } from "./Popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./Select"

export type TDateRange = DateRange

export interface DateRangePreset {
  label: string
  value: string
  dateRange: TDateRange | (() => TDateRange)
}

// Add simple props for the done button
type DateRangePickerCustomProps = {
  showConfirmButton?: boolean
  confirmButtonText?: string
  selected?: DateRange | Date | undefined
  mode?: "single" | "range"
  onSelect?: (date: DateRange | Date | undefined) => void
  rootClassName?: string
  onClose?: () => void
  wrapperClassName?: string
  // New trigger-related props
  trigger?: React.ReactNode
  triggerProps?: ButtonProps
  open?: boolean
  onOpenChange?: (open: boolean) => void
  defaultOpen?: boolean
  // Popover positioning props
  align?: "start" | "center" | "end"
  side?: "top" | "right" | "bottom" | "left"
  sideOffset?: number
  // Preset options
  presets?: DateRangePreset[]
  customOptionLabel?: string
  // Disabled state
  disabled?: boolean
}

type DateRangePickerProps = Omit<DayPickerProps, "selected" | "mode"> &
  PropsBase &
  DateRangePickerCustomProps

const generatePresetDateRange = (value: string): TDateRange => {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setUTCDate(yesterday.getUTCDate() - 1)

  switch (value) {
    case "today": {
      return { from: today, to: today }
    }
    case "yesterday": {
      return { from: yesterday, to: yesterday }
    }
    case "7days": {
      const sevenDaysAgo = new Date(today)
      sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 7)

      return { from: sevenDaysAgo, to: today }
    }
    case "14days": {
      const fourteenDaysAgo = new Date(today)
      fourteenDaysAgo.setUTCDate(fourteenDaysAgo.getUTCDate() - 14)

      return { from: fourteenDaysAgo, to: today }
    }
    case "30days": {
      const thirtyDaysAgo = new Date(today)
      thirtyDaysAgo.setUTCDate(thirtyDaysAgo.getUTCDate() - 30)

      return { from: thirtyDaysAgo, to: today }
    }
    case "3months": {
      const threeMonthsAgo = new Date(today)
      threeMonthsAgo.setUTCMonth(threeMonthsAgo.getUTCMonth() - 3)

      return { from: threeMonthsAgo, to: today }
    }
    case "6months": {
      const sixMonthsAgo = new Date(today)
      sixMonthsAgo.setUTCMonth(sixMonthsAgo.getUTCMonth() - 6)

      return { from: sixMonthsAgo, to: today }
    }
    case "12months": {
      const twelveMonthsAgo = new Date(today)
      twelveMonthsAgo.setUTCMonth(twelveMonthsAgo.getUTCMonth() - 12)

      return { from: twelveMonthsAgo, to: today }
    }
    default:
      return { from: yesterday, to: yesterday }
  }
}

const defaultPresets: DateRangePreset[] = [
  {
    label: "Today",
    value: "today",
    dateRange: generatePresetDateRange("today"),
  },
  {
    label: "Yesterday",
    value: "yesterday",
    dateRange: generatePresetDateRange("yesterday"),
  },
  {
    label: "Last 7 days",
    value: "7days",
    dateRange: generatePresetDateRange("7days"),
  },
  {
    label: "Last 14 days",
    value: "14days",
    dateRange: generatePresetDateRange("14days"),
  },
  {
    label: "Last 30 days",
    value: "30days",
    dateRange: generatePresetDateRange("30days"),
  },
  {
    label: "Last 3 months",
    value: "3months",
    dateRange: generatePresetDateRange("3months"),
  },
  {
    label: "Last 6 months",
    value: "6months",
    dateRange: generatePresetDateRange("6months"),
  },
  {
    label: "Last 12 months",
    value: "12months",
    dateRange: generatePresetDateRange("12months"),
  },
]

const areDateRangesEqual = (
  range1: TDateRange | undefined,
  range2: TDateRange | undefined
): boolean => {
  if (!range1 || !range2) return false
  if (!range1.from || !range1.to || !range2.from || !range2.to) return false

  const areDatesSameDayUTC = (date1: Date, date2: Date): boolean => {
    return (
      date1.getUTCFullYear() === date2.getUTCFullYear() &&
      date1.getUTCMonth() === date2.getUTCMonth() &&
      date1.getUTCDate() === date2.getUTCDate()
    )
  }

  return areDatesSameDayUTC(range1.from, range2.from) && areDatesSameDayUTC(range1.to, range2.to)
}

export function DateRangePicker({
  mode = "range",
  selected,
  showConfirmButton,
  confirmButtonText = "Done",
  onSelect,
  onClose,
  rootClassName,
  wrapperClassName,
  trigger,
  triggerProps,
  open: controlledOpen,
  onOpenChange,
  defaultOpen = false,
  align = "start",
  side = "bottom",
  sideOffset = 4,
  presets,
  customOptionLabel = "Custom date range",
  disabled = false,
  ...rest
}: DateRangePickerProps) {
  const [tempSelected, setTempSelected] = useState<Date | DateRange | undefined>(selected)
  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  const [preventAutoClose, setPreventAutoClose] = useState(false)
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)

  // Determine if open state is controlled
  const isControlled = controlledOpen !== undefined
  const isOpen = isControlled ? controlledOpen : internalOpen

  const setOpen = useCallback(
    (open: boolean) => {
      if (!isControlled) {
        setInternalOpen(open)
      }
      onOpenChange?.(open)
    },
    [isControlled, onOpenChange]
  )

  useEffect(() => {
    setTempSelected(selected)
  }, [selected])

  // Determine current preset based on selected date range
  useEffect(() => {
    if (!presets || !selected) {
      setSelectedPreset(null)

      return
    }

    let matchedPreset: string | null = null

    for (const preset of presets) {
      const presetRange =
        typeof preset.dateRange === "function" ? preset.dateRange() : preset.dateRange

      if (areDateRangesEqual(selected as TDateRange, presetRange)) {
        matchedPreset = preset.value
        break
      }
    }

    setSelectedPreset(matchedPreset)
  }, [selected, presets])

  // Convert "custom" to "_custom" to prevent select from reopening
  useEffect(() => {
    if (selectedPreset === "custom") {
      setSelectedPreset("_custom")
    }
  }, [selectedPreset])

  const formatDateRange = useCallback((dateRange?: TDateRange) => {
    if (!dateRange?.from) return "Select date range"

    const formatDate = (date: Date) => date.toLocaleDateString()

    if (!dateRange.to) {
      return formatDate(dateRange.from)
    }

    return `${formatDate(dateRange.from)} - ${formatDate(dateRange.to)}`
  }, [])

  const displayLabel = useMemo(() => {
    if (selectedPreset && presets) {
      if (selectedPreset === "custom" || selectedPreset === "_custom") {
        return customOptionLabel
      }
      const preset = presets.find((p) => p.value === selectedPreset)

      return preset?.label || formatDateRange(selected as TDateRange)
    }

    return formatDateRange(selected as TDateRange)
  }, [selectedPreset, presets, selected, formatDateRange, customOptionLabel])

  const handleSelect = (date: Date | DateRange | undefined) => {
    setTempSelected(date)
    // Only call onSelect immediately if not using presets (preserves existing behavior)
    // When using presets, onSelect is called only on confirm
    if (onSelect && (!presets || presets.length === 0)) {
      onSelect(date)
    }
  }

  const handleConfirm = (range: TDateRange | Date | undefined) => {
    setSelectedPreset(null) // Reset preset to allow re-detection
    setPreventAutoClose(false)
    setOpen(false)
    onSelect?.(range)
  }

  const handleCancel = () => {
    setSelectedPreset(null) // Reset preset on cancel too
    setPreventAutoClose(false)
    setOpen(false)
    onClose?.()
  }

  const handleTriggerClick = () => {
    if (!disabled) {
      setOpen(!isOpen)
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (disabled) {
      return
    }
    if (!open) {
      if (preventAutoClose) {
        setOpen(true)

        return
      }
    }
    setOpen(open)
  }

  const handlePresetSelect = (value: string) => {
    if (value === "custom") {
      setSelectedPreset("custom")
      setPreventAutoClose(true)
      setOpen(true)

      return
    }

    if (presets) {
      const preset = presets.find((p) => p.value === value)
      if (preset) {
        const dateRange =
          typeof preset.dateRange === "function" ? preset.dateRange() : preset.dateRange

        setSelectedPreset(value)
        if (onSelect) {
          onSelect(dateRange)
        }
      }
    }
  }

  const handleCustomOpenChange = (open: boolean) => {
    if (disabled) {
      return
    }
    if (!open) {
      if (preventAutoClose || selectedPreset === "custom" || selectedPreset === "_custom") {
        setOpen(true)

        return
      }
    }
    setOpen(open)
  }

  const formatSelectedText = () => {
    if (!selected) return "Select date range"

    if (mode === "single") {
      return (selected as Date).toLocaleDateString()
    }

    const range = selected as TDateRange
    if (!range.from) return ""

    if (range.to) {
      return `${range.from.toLocaleDateString()} - ${range.to.toLocaleDateString()}`
    }

    return range.from.toLocaleDateString()
  }

  const selectedText = formatSelectedText()

  const defaultClassNames = getDefaultClassNames()

  const dayPickerProps = {
    ...rest,
    mode,
    selected: mode === "range" ? (tempSelected as DateRange) : (tempSelected as Date),
    onSelect: handleSelect,
    disabled: disabled,
  } as unknown as DayPickerProps

  const datePickerElement = (
    <div
      className={cn("date-range-picker-wrapper", wrapperClassName)}
      onMouseEnter={() => setPreventAutoClose(true)}
      onMouseLeave={() => setPreventAutoClose(false)}
      onFocusCapture={(e) => {
        e.stopPropagation()
      }}
      onMouseDown={(e) => {
        e.preventDefault()
        e.stopPropagation()
      }}
      onClick={(e) => {
        e.stopPropagation()
        e.preventDefault()
      }}>
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

      {(showConfirmButton || (presets && presets.length > 0)) && (
        <div className="flex justify-end gap-4 border-t border-divider-main px-2 py-3">
          <Button
            variant="outlined"
            appearance="neutral"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handleCancel()
            }}>
            Cancel
          </Button>
          <Button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handleConfirm(tempSelected)
            }}>
            {confirmButtonText}
          </Button>
        </div>
      )}
    </div>
  )

  // If no trigger prop is provided, render just the picker (existing behavior)
  if (!trigger) {
    return datePickerElement
  }

  // If presets are provided, render with Select component
  if (presets && presets.length > 0) {
    return (
      <div className="relative">
        <Select
          key={selectedPreset || "empty"}
          value={selectedPreset || undefined}
          onValueChange={handlePresetSelect}
          disabled={disabled}>
          <SelectTrigger className="max-w-56 bg-white text-tertiary" disabled={disabled}>
            <div className="flex items-center gap-2">
              {trigger}
              <SelectValue placeholder={selectedText}>{displayLabel}</SelectValue>
            </div>
          </SelectTrigger>
          <SelectContent>
            {presets.map((preset) => (
              <SelectItem key={preset.value} value={preset.value}>
                {preset.label}
              </SelectItem>
            ))}
            <SelectItem
              className="rounded-none border-t border-divider-main"
              value="custom"
              onSelect={(e) => {
                e.preventDefault()
                setSelectedPreset((prev) => (prev === "custom" ? "_custom" : "custom"))
                setPreventAutoClose(true)
                setOpen(true)
              }}>
              {customOptionLabel}
            </SelectItem>
          </SelectContent>
        </Select>

        {/* Date picker popover for custom option */}
        <Popover
          open={isOpen && (selectedPreset === "custom" || selectedPreset === "_custom")}
          onOpenChange={handleCustomOpenChange}
          align={align}
          side={side}
          sideOffset={sideOffset}
          onOpenAutoFocus={(e) => {
            e.preventDefault()
          }}
          content={datePickerElement}>
          <PopoverTrigger asChild>
            <div className="absolute inset-0 z-[-1]" aria-hidden="true" />
          </PopoverTrigger>
        </Popover>
      </div>
    )
  }

  // If trigger is provided but no presets, render with Popover like before
  return (
    <Popover
      open={isOpen}
      onOpenChange={handleOpenChange}
      align={align}
      side={side}
      sideOffset={sideOffset}
      onOpenAutoFocus={(e) => {
        e.preventDefault()
      }}
      content={datePickerElement}>
      <PopoverTrigger asChild>
        <Button
          data-open={isOpen}
          onClick={handleTriggerClick}
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          disabled={disabled}
          {...triggerProps}>
          {trigger}
        </Button>
      </PopoverTrigger>
    </Popover>
  )
}

// Export utility functions and types
export { generatePresetDateRange, defaultPresets }
