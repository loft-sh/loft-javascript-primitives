import React, { useCallback } from "react"

import { cn } from "../clsx"
import { IconButton } from "./IconButton"
import { Tooltip } from "./Tooltip"
import { MinusCircleOutlined } from "@loft-enterprise/icons/src"

type Item = {
  value: string
  label?: React.ReactNode
  tooltipLabel?: string
}

function ListItem({
  item,
  onRemoveRequested,
  buttonClassName,
}: {
  item: Item
  buttonClassName?: string
  onRemoveRequested?: (value: string) => void
}) {
  const onClick = useCallback(() => {
    onRemoveRequested?.(item.value)
  }, [onRemoveRequested, item.value])

  return (
    <div className={"flex w-full flex-row items-center justify-between text-sm text-primary"}>
      <div className={"truncate"}>
        <Tooltip className={"z-top-level"} content={`${item.label ?? item.value}`}>
          <span className={"block truncate"}>{item.label ?? item.value}</span>
        </Tooltip>
      </div>
      <Tooltip
        className={"z-top-level"}
        content={<span>Remove {item.tooltipLabel ?? item.label ?? item.value}</span>}>
        <IconButton
          appearance="ghost"
          size="large"
          className={cn("mr-1.5", buttonClassName)}
          onClick={onClick}>
          <MinusCircleOutlined />
        </IconButton>
      </Tooltip>
    </div>
  )
}

export function RemovableItemsList({
  className,
  items,
  buttonClassName,
  onRemoveRequested,
}: {
  className?: string
  items?: Item[]
  buttonClassName?: string
  onRemoveRequested?: (value: string) => void
}) {
  return (
    <div className={cn("flex flex-col", className)}>
      {items?.map((item) => (
        <ListItem
          key={item.value}
          buttonClassName={buttonClassName}
          item={item}
          onRemoveRequested={onRemoveRequested}
        />
      ))}
    </div>
  )
}
