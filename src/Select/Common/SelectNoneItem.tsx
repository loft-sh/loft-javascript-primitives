import React from "react"

import { cn } from "../../../cn-utils"
import { SelectItem } from "../Select"

export const SELECT_NONE_VALUE = "__select_none__"

type SelectNoneItemProps = {
  children: React.ReactNode
  className?: string
}

export function SelectNoneItem({ children, className }: SelectNoneItemProps) {
  return (
    <SelectItem value={SELECT_NONE_VALUE} className={cn("text-tertiary", className)}>
      {children}
    </SelectItem>
  )
}
