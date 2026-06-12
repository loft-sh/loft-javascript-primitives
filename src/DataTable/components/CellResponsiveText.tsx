import React from "react"

import cn from "../../../clsx"
import { Tooltip } from "../../Tooltip"

type TCellResponsiveTextProps = {
  children: React.ReactNode
  className?: string
  tooltip?: React.ReactNode
  wrappingTriggerDiv?: boolean
}

export const CellResponsiveText = ({
  children,
  className,
  tooltip,
  wrappingTriggerDiv = true,
}: TCellResponsiveTextProps) => {
  return (
    <Tooltip content={tooltip} wrappingTriggerDiv={wrappingTriggerDiv}>
      <span className={cn("inline-block w-full truncate align-middle transition-all", className)}>
        {children}
      </span>
    </Tooltip>
  )
}
