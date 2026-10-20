import React from "react"

import { cn } from "../cn-utils"
import { PlusOutlined } from "@loft-enterprise/icons"

export type AddProps = {
  label: React.ReactNode
  icon?: React.ReactNode
  className?: string
  disabled?: boolean
  borderless?: boolean
  onAddRequested?: (target: HTMLElement) => void
}

export const Add = React.forwardRef<HTMLDivElement, AddProps>(
  ({ label, icon, onAddRequested, disabled, className, borderless }, ref) => {
    return (
      <div
        ref={ref}
        role="button"
        onClick={(e) => {
          e.stopPropagation()

          if (!onAddRequested || disabled) {
            return
          }

          onAddRequested(e.currentTarget)
        }}
        aria-disabled={disabled}
        tabIndex={0}
        onKeyDown={(e) => {
          e.stopPropagation()

          if (!onAddRequested || disabled) {
            return
          }

          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            onAddRequested(e.currentTarget)
          }
        }}
        className={cn(
          "flex w-full cursor-pointer flex-row items-center rounded-md",
          "justify-center border border-divider-main p-2.5 text-neutral-dark",
          "select-none gap-1 text-xs font-semibold focus-visible:outline",
          "transition-colors",
          {
            "!border-divider-light !text-neutral-main": disabled && !borderless,
            "!border-none": borderless,
            "!cursor-default text-disabledColor-main": disabled,
            "hover:text-neutral-mid-light": !disabled,
          },
          className
        )}>
        {icon || <PlusOutlined className={"size-3 *:size-3"} />}
        {label}
      </div>
    )
  }
)

Add.displayName = "Add"
