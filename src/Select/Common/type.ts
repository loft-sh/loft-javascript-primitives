import * as React from "react"

import cn from "../../../clsx"

export type CommonSelectTriggerProps = {
  inputSize?: "default" | "small" | "large"
  className?: string
  children?: React.ReactNode
  error?: boolean
  variant?: "ready" | "loading"
}

export namespace CommonSelectStyles {
  export const TRIGGER = cn(
    "bg-white ring-offset-background placeholder:text-muted-foreground focus:ring-ring shadow-sm group flex w-full items-center",
    "justify-between whitespace-nowrap rounded-md border border-divider-main px-3 py-2 text-sm",
    "outline-none transition-all hover:cursor-pointer hover:border-primary-main focus:border-primary-main",
    "disabled:cursor-not-allowed disabled:bg-disabled-light disabled:text-disabledColor-dark disabled:border-divider-main",
    "data-[state=open]:text-disabledColor-dark [&>span]:line-clamp-1"
  )

  export const CONTENT = cn(
    "relative z-[1100] max-h-96 rounded-md border bg-white text-primary shadow-md",
    "data-[side=bottom]:animate-slide-in-top data-[side=left]:animate-slide-in-right",
    "data-[side=right]:animate-slide-in-left data-[side=top]:animate-slide-in-bottom data-[state=closed]:animate-out",
    "data-[state=open]:animate-in"
  )

  export const CONTENT_POPPER = cn(
    "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1",
    "data-[side=top]:-translate-y-1"
  )

  export const ITEM = cn(
    "relative box-border flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm",
    "outline-none transition-colors hover:bg-neutral-extra-light data-[disabled]:pointer-events-none",
    "data-[state=checked]:bg-neutral-light/50 data-[state=checked]:text-secondary data-[disabled]:opacity-50"
  )
}
