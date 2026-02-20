import React from "react"

import { cn } from "../../../cn-utils"
import { SelectItem } from "../Select"
import { CloseOutlined } from "@loft-enterprise/icons"

type ClearableSelectItemProps = {
  value: string
  children: React.ReactNode
  onClear?: (value: string) => void
  className?: string
}

export const ClearableSelectItem = React.forwardRef<
  React.ElementRef<typeof SelectItem>,
  ClearableSelectItemProps
>(({ value, children, onClear, className, ...props }, ref) => {
  const handleClearClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    onClear?.(value)
  }

  return (
    <SelectItem ref={ref} value={value} className={cn("pr-2", className)} {...props}>
      <div className="flex w-full items-center justify-between">
        <span className="flex-1 truncate">{children}</span>
        <CloseOutlined
          className="text-muted-foreground hover:text-foreground ml-2 h-4 w-4 flex-shrink-0 cursor-pointer"
          onClick={handleClearClick}
        />
      </div>
    </SelectItem>
  )
})

ClearableSelectItem.displayName = "ClearableSelectItem"
