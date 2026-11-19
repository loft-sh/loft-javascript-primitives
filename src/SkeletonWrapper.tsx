import cn from "classnames"
import React from "react"

import { Skeleton } from "./Skeleton"

interface SkeletonWrapperProps {
  loading: boolean
  wrapperClassName?: string
  skeletonClassName?: string
  children: React.ReactNode
}

const SkeletonWrapper: React.FC<SkeletonWrapperProps> = ({
  loading,
  skeletonClassName,
  children,
  wrapperClassName,
}) => (
  <div className={cn("relative", wrapperClassName)}>
    {loading && <Skeleton className={cn("absolute inset-0 h-full w-full", skeletonClassName)} />}
    <div className={cn({ "block h-full w-full opacity-0": loading })}>{children}</div>
  </div>
)

export { SkeletonWrapper }
