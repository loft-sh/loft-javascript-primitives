import React from "react"

import { cn } from "../clsx"

export function Loading({
  className,
  spinnerClassName,
  variant = "regular",
}: {
  className?: string
  spinnerClassName?: string
  variant?: "regular" | "pronounced"
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn("flex w-full flex-row items-center justify-center", className)}>
      <svg
        viewBox="0 0 300 300"
        focusable="false"
        aria-hidden="true"
        fill="currentColor"
        className={cn(
          "size-12 animate-rotate-loading-spinner text-primaryColor-main",
          spinnerClassName
        )}>
        {variant === "pronounced" ? (
          <path d="M 150.00 65.00 L 150.00 30.00 A 120 120 0 0 1 210.00 253.92 L 192.50 223.61 A 85 85  0 0 0 150.00 65.00 Z"></path>
        ) : (
          <path d="M 150.00 65.00 L 150.00 50.00 A 100 100 0 0 1 250.00 150.00 L 235.00 150.00 A 85 85  0 0 0 150.00 65.00 Z"></path>
        )}
      </svg>
      <span className="sr-only">Loading...</span>
    </div>
  )
}
