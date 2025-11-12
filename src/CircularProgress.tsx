import * as React from "react"

import cn from "../clsx/index"

export enum ProgressVariant {
  PRIMARY = "PRIMARY",
  DANGER = "DANGER",
  WARNING = "WARNING",
  SUCCESS = "SUCCESS",
}

type CircularProgressProps = {
  percent: number
  size?: number
  strokeWidth?: number
  variant?: ProgressVariant
  className?: string
  showPercentage?: boolean
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

const CircularProgress = React.forwardRef<HTMLDivElement, CircularProgressProps>(
  (
    {
      percent,
      size = 80,
      strokeWidth = 8,
      variant = ProgressVariant.PRIMARY,
      className,
      showPercentage = false,
    },
    ref
  ) => {
    // Eliminate possible NaN and clamp to range [0, 100].
    const clampedPercentage = Math.max(Math.min(percent || 0, 100), 0)

    // Calculate circle properties
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const offset = circumference - (clampedPercentage / 100) * circumference

    return (
      <>
        <style>
          {`
            @keyframes progressPulse {
              0%, 100% {
                opacity: 0.4;
              }
              50% {
                opacity: 1;
              }
            }
            .progress-pulse {
              animation: progressPulse 1.2s ease-in-out infinite;
            }
          `}
        </style>
        <div
          ref={ref}
          className={cn("relative inline-flex items-center justify-center", className)}>
          <svg width={size} height={size} className="-rotate-90 transform">
            {/* Background circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              strokeWidth={strokeWidth}
              className="progress-pulse fill-none stroke-neutral-extra-light"
            />
            {/* Progress circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className={cn(
                "ease-[cubic-bezier(0.65,0,0.35,1)] fill-none transition-all duration-200",
                COLORS[variant]
              )}
            />
          </svg>
          {showPercentage && (
            <div className={cn("absolute text-xs font-medium", TEXT_COLORS[variant])}>
              {Math.round(clampedPercentage)}%
            </div>
          )}
        </div>
      </>
    )
  }
)

CircularProgress.displayName = "CircularProgress"

export { CircularProgress }
