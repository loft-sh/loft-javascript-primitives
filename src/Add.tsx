import React from "react"

import { cn } from "../cn-utils"
import { PlusOutlined } from "@loft-enterprise/icons"

export namespace AddStyles {
  export const BASE = cn(
    "flex w-full cursor-pointer flex-row items-center justify-center gap-1 rounded-md",
    "p-2.5 text-xs font-semibold text-neutral-dark",
    "select-none transition-colors focus-visible:outline",
    "hover:text-neutral-mid-light",
    "disabled:!cursor-default aria-disabled:!cursor-default"
  )

  export const BORDERED = cn(
    "border border-divider-main",
    "disabled:!border-divider-light disabled:!text-neutral-main disabled:hover:!text-neutral-main",
    "aria-disabled:!border-divider-light aria-disabled:!text-neutral-main aria-disabled:hover:!text-neutral-main"
  )

  export const BORDERLESS = cn(
    "border-none",
    "disabled:!text-disabledColor-main disabled:hover:!text-disabledColor-main",
    "aria-disabled:!text-disabledColor-main aria-disabled:hover:!text-disabledColor-main"
  )
}

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
          AddStyles.BASE,
          borderless ? AddStyles.BORDERLESS : AddStyles.BORDERED,
          className
        )}>
        {icon || <PlusOutlined className={"size-3 *:size-3"} />}
        {label}
      </div>
    )
  }
)

Add.displayName = "Add"
