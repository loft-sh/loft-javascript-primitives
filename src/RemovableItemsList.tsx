import React, { useCallback, useId, useMemo } from "react"

import { cn } from "../clsx"
import { IconButton } from "./IconButton"
import { Tooltip } from "./Tooltip"
import { MinusCircleOutlined } from "@loft-enterprise/icons/src"
import { str } from "@loft-enterprise/shared"

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
  const id = useId()
  const labelId = `${id}-label`

  const onClick = useCallback(() => {
    onRemoveRequested?.(item.value)
  }, [onRemoveRequested, item.value])

  const label = useMemo(() => {
    if (!item.label) {
      return undefined
    }

    if (React.isValidElement(item.label)) {
      return item.label
    }

    return str(item.label)
  }, [item.label])

  return (
    <div
      role="listitem"
      aria-labelledby={labelId}
      className={"flex w-full flex-row items-center justify-between text-sm text-primary"}>
      <div className={"truncate"}>
        <Tooltip content={label ?? str(item.value)}>
          <span id={labelId} className={"block truncate"}>
            {label ?? item.value}
          </span>
        </Tooltip>
      </div>
      <Tooltip content={<span>Remove {item.tooltipLabel ?? label ?? item.value}</span>}>
        <IconButton
          appearance="ghost"
          size="large"
          aria-label={`Remove ${item.tooltipLabel ?? label ?? item.value}`}
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
    <div role="list" className={cn("flex flex-col", className)}>
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
