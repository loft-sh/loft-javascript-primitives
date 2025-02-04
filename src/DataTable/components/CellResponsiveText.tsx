import React from "react"

import cn from "../../../clsx"
import { Tooltip } from "../../Tooltip"

type TCellResponsiveTextProps = {
  children: React.ReactNode
  className?: string
  tooltip?: React.ReactNode
}

export const CellResponsiveText = ({ children, className, tooltip }: TCellResponsiveTextProps) => {
  return (
    <Tooltip content={tooltip}>
      <span className={cn("inline-block w-full truncate align-middle transition-all", className)}>
        {children}
      </span>
    </Tooltip>
  )
}
