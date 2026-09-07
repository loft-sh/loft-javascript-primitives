import * as ProgressPrimitive from "@radix-ui/react-progress"
import * as React from "react"

import { cn } from "../cn-utils"
import { XOr } from "@loft-enterprise/shared"

export enum ProgressVariant {
  PRIMARY = "PRIMARY",
  DANGER = "DANGER",
  WARNING = "WARNING",
  SUCCESS = "SUCCESS",
}

type ProgressProps = {
  percent: number
  wrapperClassName?: string
  trackClassName?: string
  barClassName?: string
  variant?: ProgressVariant
  hideBackground?: boolean
  leftAddon?: React.ReactNode
  rightAddon?: React.ReactNode
}

const COLORS: { [key in ProgressVariant]: string } = {
  [ProgressVariant.PRIMARY]: "bg-primary-main",
  [ProgressVariant.DANGER]: "bg-danger-main",
  [ProgressVariant.WARNING]: "bg-warning-main",
  [ProgressVariant.SUCCESS]: "bg-success-main",
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      wrapperClassName,
      trackClassName,
      barClassName,
      percent,
      variant = ProgressVariant.PRIMARY,
      hideBackground,
      leftAddon,
      rightAddon,
    },
    ref
  ) => {
    // Eliminate possible NaN and clamp to range [0, 100].
    const clampedPercentage = Math.max(Math.min(percent || 0, 100), 0)

    return (
      <div ref={ref} className={cn("flex w-full flex-row items-center gap-2", wrapperClassName)}>
        {leftAddon && <div className={"flex-shrink-0 text-xs"}>{leftAddon}</div>}
        <div
          className={cn(
            "h-3 flex-grow overflow-hidden rounded-sm",
            {
              "bg-neutral-extra-light": !hideBackground,
              "bg-transparent": hideBackground,
            },
            trackClassName
          )}>
          <div
            className={cn(
              "ease-[cubic-bezier(0.65, 0, 0.35, 1)] transition-width h-full rounded-sm duration-200",
              COLORS[variant],
              barClassName
            )}
            style={{ width: `${clampedPercentage}%` }}></div>
        </div>
        {rightAddon && <div className={"flex-shrink-0 text-xs"}>{rightAddon}</div>}
      </div>
    )
  }
)

Progress.displayName = ProgressPrimitive.Root.displayName

type MultiProgressSegment = {
  value: number
} & XOr<{ variant: ProgressVariant }, { className: string }>

type MultiProgressProps = {
  segments: MultiProgressSegment[]
  className?: string
  hideBackground?: boolean
}

const MultiProgress = React.forwardRef<HTMLDivElement, MultiProgressProps>(
  ({ segments, className, hideBackground }, ref) => {
    const total = segments.reduce((sum, segment) => sum + Math.max(segment.value || 0, 0), 0)

    return (
      <div
        ref={ref}
        className={cn(
          "flex h-3 w-full overflow-hidden rounded-sm",
          {
            "bg-neutral-extra-light": !hideBackground,
            "bg-transparent": hideBackground,
          },
          className
        )}>
        {segments.map((segment, index) => {
          const value = Math.max(segment.value || 0, 0)
          const width = total > 0 ? (value / total) * 100 : 0
          if (width === 0) {
            return null
          }

          return (
            <div
              key={index}
              className={cn(
                "ease-[cubic-bezier(0.65, 0, 0.35, 1)] transition-width h-full duration-200",
                segment.variant ? COLORS[segment.variant] : undefined,
                segment.className
              )}
              style={{ width: `${width}%` }}
            />
          )
        })}
      </div>
    )
  }
)

MultiProgress.displayName = "MultiProgress"

export { Progress, MultiProgress }
export type { MultiProgressSegment, MultiProgressProps }
