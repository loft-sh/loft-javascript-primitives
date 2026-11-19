import React, { useRef } from "react"

import { Button } from "../../Button"
import { PopoverAnchor, PopoverContent, PopoverRoot, PopoverTrigger } from "../../Popover"
import { DateRangeMenu } from "./DateRangeMenu"
import { ChipFilter, getChipLabel } from "./definitions"
import { OptionsMenu } from "./OptionsMenu"
import { CloseOutlined } from "@loft-enterprise/icons"

export function FilterChip({
  chip,
  value,
  open,
  disabled,
  onChange,
  onOpenRequested,
  onCloseRequested,
  onHideRequested,
  onRemoveRequested,
}: {
  chip: ChipFilter
  value: readonly string[]
  open: boolean
  disabled?: boolean
  onChange: (value: string[]) => void
  onOpenRequested: () => void
  onCloseRequested: () => void
  onHideRequested: () => void
  onRemoveRequested: () => void
}) {
  const switchingCategory = useRef(false)
  const text = value.length > 0 ? getChipLabel(chip, value) : chip.label

  return (
    <PopoverRoot
      open={!disabled && open}
      onOpenChange={(next) => (next ? onOpenRequested() : onCloseRequested())}>
      <PopoverAnchor asChild>
        <span className="flex h-6 max-w-72 items-center gap-1 rounded border border-neutral-main px-1.5 py-0.5 text-sm font-medium text-secondary">
          <PopoverTrigger asChild>
            <button
              type="button"
              disabled={disabled}
              className="flex min-w-0 items-center gap-1"
              aria-label={`${chip.label} filter: ${text}`}>
              {chip.Icon && <chip.Icon className="size-4 shrink-0 *:size-4" />}
              <span className="truncate">{text}</span>
            </button>
          </PopoverTrigger>
          <button
            type="button"
            disabled={disabled}
            className="flex shrink-0 [&_svg]:size-3"
            aria-label={`Remove ${chip.label} filter`}
            onClick={onRemoveRequested}>
            <CloseOutlined />
          </button>
        </span>
      </PopoverAnchor>
      <PopoverContent
        align="start"
        sideOffset={0}
        onInteractOutside={(event) => {
          if (
            event.target instanceof Element &&
            event.target.closest("[data-filter-category-menu]")
          ) {
            event.preventDefault()
            switchingCategory.current = true
            onHideRequested()
          }
        }}
        onCloseAutoFocus={(event) => {
          if (switchingCategory.current) {
            event.preventDefault()
            switchingCategory.current = false
          }
        }}
        className="z-top-level w-[308px] p-0"
        aria-label={`${chip.label} filter`}
        onKeyDownCapture={(e) => {
          if (e.key === "Escape") {
            e.stopPropagation()
            onCloseRequested()
          }
        }}>
        {chip.type === "dateRange" ? (
          <DateRangeMenu value={value} onChange={onChange} />
        ) : (
          <OptionsMenu
            value={value}
            onChange={onChange}
            onCloseRequested={onCloseRequested}
            options={chip.options}
            label={chip.label}
            single={chip.type === "select"}
          />
        )}
        <div className="flex items-center justify-end border-t border-divider-main p-2">
          <Button appearance="brand" size="small" onClick={onCloseRequested}>
            Apply
          </Button>
        </div>
      </PopoverContent>
    </PopoverRoot>
  )
}
