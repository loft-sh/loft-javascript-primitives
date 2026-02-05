import * as React from "react"

import { cn } from "../cn-utils"
import { clamp } from "@loft-enterprise/shared"

export enum ProgressVariant {
  PRIMARY = "PRIMARY",
  DANGER = "DANGER",
  WARNING = "WARNING",
  SUCCESS = "SUCCESS",
}

type CircularProgressProps = {
  percent?: number
  size?: number
  strokeWidth?: number
  variant?: ProgressVariant
  className?: string
  showPercentage?: boolean
  label?: string
  indeterminate?: boolean
}

const COLORS: { [key in ProgressVariant]: string } = {
  [ProgressVariant.PRIMARY]: "stroke-primary-main",
  [ProgressVariant.DANGER]: "stroke-danger-main",
  [ProgressVariant.WARNING]: "stroke-warning-main",
  [ProgressVariant.SUCCESS]: "stroke-success-main",
}

const TEXT_COLORS: { [key in ProgressVariant]: string } = {
  [ProgressVariant.PRIMARY]: "text-primary-main",
  [ProgressVariant.DANGER]: "text-danger-main",
  [ProgressVariant.WARNING]: "text-warning-main",
  [ProgressVariant.SUCCESS]: "text-success-main",
}

const BG_COLORS: { [key in ProgressVariant]: string } = {
  [ProgressVariant.PRIMARY]: "var(--loft-primary)",
  [ProgressVariant.DANGER]: "var(--loft-error)",
  [ProgressVariant.WARNING]: "var(--loft-warning)",
  [ProgressVariant.SUCCESS]: "var(--loft-success)",
}

const CircularProgress = React.forwardRef<HTMLDivElement, CircularProgressProps>(
  (
    {
      percent = 0,
      size = 80,
      strokeWidth = 8,
      variant = ProgressVariant.PRIMARY,
      className,
      showPercentage = false,
      label = "Progress",
      indeterminate = false,
    },
    ref
  ) => {
    const uniqueId = React.useId()

    const clampedPercentage = clamp(percent, 0, 100)

    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const offset = indeterminate
      ? circumference - 0.25 * circumference // 25% arc for indeterminate
      : circumference - (clampedPercentage / 100) * circumference
    const center = size / 2

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuenow={indeterminate ? undefined : clampedPercentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        className={cn(
          "relative inline-flex items-center justify-center",
          { "animate-spin": indeterminate },
          className
        )}
        style={indeterminate ? { animationDuration: "2s" } : undefined}>
        <svg width={size} height={size} className="-rotate-90 transform">
          <defs>
            <linearGradient
              id={`wave-gradient-${uniqueId}`}
              gradientUnits="userSpaceOnUse"
              x1="0"
              y1="0"
              x2={size}
              y2={size}>
              <stop offset="0%" stopColor={BG_COLORS[variant]} stopOpacity="0.1" />
              <stop offset="25%" stopColor={BG_COLORS[variant]} stopOpacity="0.25" />
              <stop offset="50%" stopColor={BG_COLORS[variant]} stopOpacity="0.1" />
              <stop offset="75%" stopColor={BG_COLORS[variant]} stopOpacity="0.25" />
              <stop offset="100%" stopColor={BG_COLORS[variant]} stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {!indeterminate && (
            <g
              className="animate-progress-wave"
              style={{ transformOrigin: `${center}px ${center}px` }}>
              <circle
                cx={center}
                cy={center}
                r={radius}
                strokeWidth={strokeWidth}
                stroke={`url(#wave-gradient-${uniqueId})`}
                className="fill-none"
              />
            </g>
          )}

          {indeterminate && (
            <circle
              cx={center}
              cy={center}
              r={radius}
              strokeWidth={strokeWidth}
              className="fill-none stroke-neutral-extra-light"
            />
          )}

          <circle
            cx={center}
            cy={center}
            r={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={cn("fill-none", COLORS[variant], {
              "transition-all duration-300": !indeterminate,
            })}
          />
        </svg>
        {showPercentage && !indeterminate && (
          <div className={cn("absolute text-xs font-medium", TEXT_COLORS[variant])}>
            {Math.round(clampedPercentage)}%
          </div>
        )}
      </div>
    )
  }
)

CircularProgress.displayName = "CircularProgress"

export { CircularProgress }
