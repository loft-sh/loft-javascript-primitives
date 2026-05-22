import React from "react"

import { cn } from "../cn-utils"
import { IconComponentFunction } from "@loft-enterprise/shared"

export function IconText({
  icon: Icon,
  children,
  className,
  id,
}: {
  icon?: IconComponentFunction
  children?: React.ReactNode
  className?: string
  id?: string
}) {
  return (
    <div id={id} className={cn("flex flex-row gap-2", className)}>
      {Icon && (
        <div className="flex h-[1lh] w-4 flex-shrink-0 flex-col justify-center leading-[inherit]">
          <Icon className="size-4 *:size-4" aria-hidden="true" />
        </div>
      )}
      {children}
    </div>
  )
}
