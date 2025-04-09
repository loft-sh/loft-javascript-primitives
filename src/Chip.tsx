import CloseOutlined from "@ant-design/icons/CloseOutlined"
import React, { LegacyRef } from "react"

import { cn } from "../clsx/index"

type Props = {
  size?: "small" | "medium" | "large"
  appearance?: "default" | "dark" | "danger" | "primary" | "success" | "warning" | "neutral"
  icon?: React.ReactNode
  clearable?: boolean
  children: React.ReactNode
  onClear?: () => void
  className?: string
}

const Chip = React.forwardRef(
  (
    {
      size = "medium",
      appearance = "default",
      icon,
      clearable,
      children,
      onClear,
      className,
    }: Props,
    ref: React.Ref<HTMLDivElement> | LegacyRef<HTMLDivElement>
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex w-fit flex-row items-center justify-center gap-1 rounded border border-neutral-main bg-neutral-light px-1 py-0.5 text-xs font-bold text-tertiary [&_svg]:size-3",
          {
            "font-normal [&_svg]:size-2": size === "small",
            "px-1.5": size === "large",
            "bg-neutral-dark text-white": appearance === "dark",
            "border   border-danger-light bg-danger-extra-light text-danger-main":
              appearance === "danger",
            "text-primary-dark border   border-primary-light bg-primary-extra-light":
              appearance === "primary",
            "border   border-success-light bg-success-extra-light text-success-dark":
              appearance === "success",
            "border   border-warning-light bg-warning-extra-light text-warning-dark":
              appearance === "warning",
            "border border-neutral-main bg-neutral-extra-light text-neutral-dark":
              appearance === "neutral",
          },
          className
        )}>
        {icon && (
          <span
            className={cn("flex", {
              "[&_svg]:!size-2": size === "medium",
            })}>
            {icon}
          </span>
        )}
        {children}
        {clearable && <CloseOutlined className="cursor-pointer" onClick={onClear} />}
      </div>
    )
  }
)

Chip.displayName = "Chip"

export { Chip }
