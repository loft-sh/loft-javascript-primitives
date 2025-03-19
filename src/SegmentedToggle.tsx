import React, { useCallback } from "react"

import cn from "../clsx"

type SegmentItem<ValueType> = {
  value: ValueType
  label: string
}

type BaseProps<ValueType> = {
  selectedItem: ValueType
  onSelectItem: (selectedItem: ValueType) => void
}

type SegmentProps<ValueType> = BaseProps<ValueType> & {
  item: SegmentItem<ValueType>
}

export type SegmentedToggleProps<ValueType = string> = BaseProps<ValueType> & {
  items: { value: ValueType; label: string }[]
  className?: string
}

function Segment<ValueType>({ item, selectedItem, onSelectItem }: SegmentProps<ValueType>) {
  const isSelected = item.value === selectedItem

  const onClick = useCallback(() => {
    onSelectItem(item.value)
  }, [onSelectItem, item])

  return (
    <div
      className={cn("box-border cursor-pointer select-none rounded-sm px-1", {
        "border border-primary-light bg-primary-extra-light font-medium text-primaryColor-dark":
          isSelected,
        "font-normal text-secondary": !isSelected,
      })}
      onClick={onClick}>
      {item.label}
    </div>
  )
}

const SegmentedToggle = <ValueType extends string>({
  items,
  selectedItem,
  onSelectItem,
  className,
}: SegmentedToggleProps<ValueType>) => {
  return (
    <div
      className={cn(
        "box-border flex flex-row items-center gap-1 rounded-md border border-divider-main p-1 text-sm",
        className
      )}>
      {items.map((item, index) => (
        <Segment key={index} selectedItem={selectedItem} onSelectItem={onSelectItem} item={item} />
      ))}
    </div>
  )
}

SegmentedToggle.displayName = "SegmentedToggle"

export { SegmentedToggle }
