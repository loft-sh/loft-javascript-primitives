import React from "react"

import cn from "../clsx"

export enum CountTheme {
  PRIMARY = "primary",
  DANGER = "danger",
  WARNING = "warning",
  NEUTRAL = "neutral",
}

export enum CountSize {
  XS = "xs",
  SM = "sm",
  MD = "md",
  LG = "lg",
}

export type CountProps = {
  count?: number
  theme?: CountTheme
  size?: CountSize
  inverse?: boolean
  text?: {
    singular: string
    plural: string
  }
  max?: number
  className?: string
}

export function Count({
  count,
  size = CountSize.MD,
  theme = CountTheme.PRIMARY,
  inverse,
  className,
  max,
  text,
}: CountProps) {
  return (
    <div
      className={cn(
        "inline-flex w-fit flex-col items-center justify-center overflow-ellipsis whitespace-nowrap rounded-2xl text-sm font-semibold",
        {
          "h-2 min-w-2": size === CountSize.XS,
          "h-3 min-w-3 px-0.5 text-[10px]": size === CountSize.SM,
          "h-4 min-w-4 px-0.5": size === CountSize.MD,
          "h-5 min-w-5 px-1.5": size === CountSize.LG,
        },
        {
          "bg-primary-main text-primaryColor-contrast": theme === CountTheme.PRIMARY && !inverse,
          "bg-warning-main text-warning-contrast": theme === CountTheme.WARNING && !inverse,
          "bg-danger-main text-danger-contrast": theme === CountTheme.DANGER && !inverse,
          "bg-neutral-main text-neutral-contrast": theme === CountTheme.NEUTRAL && !inverse,
          "border border-primary-main text-primaryColor-main":
            theme === CountTheme.PRIMARY && inverse,
          "border border-warning-main text-warning-main": theme === CountTheme.WARNING && inverse,
          "border border-danger-main text-danger-main": theme === CountTheme.DANGER && inverse,
          "border border-neutral-main text-neutral-main": theme === CountTheme.NEUTRAL && inverse,
        },
        className
      )}>
      {typeof count === "number" && size !== CountSize.XS && (
        <span>
          {max && count > max ? `${max}+` : count}{" "}
          {Math.abs(count) !== 1 ? text?.plural : text?.singular}
        </span>
      )}
    </div>
  )
}
