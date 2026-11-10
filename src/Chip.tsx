import CloseOutlined from "@ant-design/icons/CloseOutlined"
import React, { LegacyRef } from "react"

import { cn } from "../cn-utils"

type Props = {
  size?: "small" | "medium" | "large"
  appearance?:
    | "default"
    | "dark"
    | "danger"
    | "primary"
    | "success"
    | "warning"
    | "neutral"
    | "branded"
  variant?: "default" | "outlined"
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
      variant = "default",
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
            "border border-danger-main bg-danger-extra-light text-danger-main":
              appearance === "danger" && variant === "default",
            "border border-primary-main bg-primary-extra-light text-primaryColor-dark":
              appearance === "primary" && variant === "default",
            "border border-success-main bg-success-extra-light text-success-dark":
              appearance === "success" && variant === "default",
            "border border-warning-main bg-warning-extra-light text-warning-dark":
              appearance === "warning" && variant === "default",
            "border border-neutral-main bg-neutral-extra-light text-neutral-dark":
              appearance === "neutral" && variant === "default",
            "border border-danger-light bg-transparent text-danger-main":
              appearance === "danger" && variant === "outlined",
            "border border-primary-light bg-transparent text-primaryColor-main":
              appearance === "primary" && variant === "outlined",
            "border border-success-light bg-transparent text-success-main":
              appearance === "success" && variant === "outlined",
            "border border-warning-light bg-transparent text-warning-main":
              appearance === "warning" && variant === "outlined",
            "border border-neutral-light bg-transparent text-neutral-main":
              appearance === "neutral" && variant === "outlined",
            "border-vCluster-main border border-vCluster bg-white text-vCluster":
              appearance === "branded" && variant === "default",
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
