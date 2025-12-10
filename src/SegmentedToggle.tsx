import React, { useCallback } from "react"

import cn from "../clsx"
import { Tooltip } from "./Tooltip"

export type SegmentItem<ValueType> = {
  value: ValueType
  label: string
  tooltip?: string
}

type BaseProps<ValueType> = {
  selectedItem: ValueType
  onSelectItem: (selectedItem: ValueType) => void
  stretch?: boolean
}

type SegmentProps<ValueType> = BaseProps<ValueType> & {
  item: SegmentItem<ValueType>
  disabled?: boolean
}

export type SegmentedToggleProps<ValueType = string> = BaseProps<ValueType> & {
  items: SegmentItem<ValueType>[]
  className?: string
  disabled?: boolean
}

function Segment<ValueType>({
  item,
  selectedItem,
  stretch,
  disabled,
  onSelectItem,
}: SegmentProps<ValueType>) {
  const isSelected = item.value === selectedItem

  const onClick = useCallback(() => {
    if (disabled || isSelected) {
      return
    }

    onSelectItem(item.value)
  }, [onSelectItem, item, disabled, isSelected])

  return (
    <Tooltip wrappingTriggerDiv={false} content={item.tooltip}>
      <div
        role="radio"
        aria-label={item.label}
        aria-checked={isSelected}
        aria-disabled={disabled}
        className={cn("box-border cursor-pointer select-none rounded-sm px-1", {
          "border border-neutral-light bg-neutral-extra-light font-medium text-neutral-dark":
            isSelected,
          "font-normal text-secondary": !isSelected,
          "border-disabled-light bg-neutral-extra-light text-disabledColor-dark":
            isSelected && disabled,
          "text-disabledColor-main": !isSelected && disabled,
          "cursor-auto": disabled,
          "flex-1 text-center": stretch,
        })}
        tabIndex={0}
        onClick={onClick}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !disabled && !isSelected) {
            e.preventDefault()
            onSelectItem(item.value)
          }
        }}>
        {item.label}
      </div>
    </Tooltip>
  )
}

const SegmentedToggle = <ValueType extends string>({
  items,
  selectedItem,
  onSelectItem,
  stretch,
  disabled,
  className,
}: SegmentedToggleProps<ValueType>) => {
  return (
    <div
      role="radiogroup"
      className={cn(
        "box-border flex flex-row items-center gap-1 rounded-md border border-divider-main p-1 text-sm",
        className
      )}>
      {items.map((item, index) => (
        <Segment
          key={index}
          disabled={disabled}
          stretch={stretch}
          selectedItem={selectedItem}
          onSelectItem={onSelectItem}
          item={item}
        />
      ))}
    </div>
  )
}

SegmentedToggle.displayName = "SegmentedToggle"

export { SegmentedToggle }
