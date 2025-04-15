import * as ProgressPrimitive from "@radix-ui/react-progress"
import * as React from "react"

import cn from "../clsx/index"

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
              "ease-[cubic-bezier(0.65, 0, 0.35, 1)] transition-width h-full rounded-sm duration-[200ms]",
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

export { Progress }
