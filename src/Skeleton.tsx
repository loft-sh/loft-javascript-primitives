import React from "react"

import { cn } from "../clsx"

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("animate-pulse rounded-md bg-neutral-extra-light", className)} {...props} />
  )
}

export { Skeleton }
