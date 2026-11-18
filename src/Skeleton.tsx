import React from "react"

import { cn } from "../cn-utils"

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-skeleton-gradient rounded-md bg-gradient-to-r from-neutral-extra-light via-neutral-light/40 to-neutral-extra-light bg-[length:200%_100%]",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
