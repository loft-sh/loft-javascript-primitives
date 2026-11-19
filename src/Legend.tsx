import React from "react"

import { cn } from "../cn-utils"

export type LegendItem = {
  className: string
  title: string
  auxiliaryContent?: React.ReactNode
}

export type LegendProps = {
  items: LegendItem[]
  className?: string
}

export function Legend({ items, className }: LegendProps) {
  return (
    <div className={cn("flex flex-row items-center gap-2", className)}>
      {items.map((item) => (
        <div key={item.title} className="flex flex-row items-center gap-1">
          <div className={cn("h-2 w-2 shrink-0 rounded-full", item.className)} />
          <div className="flex flex-row items-center gap-2">
            <div className="text-xs text-secondary">{item.title}</div>
            {item.auxiliaryContent && (
              <div className="text-xs text-tertiary">{item.auxiliaryContent}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
