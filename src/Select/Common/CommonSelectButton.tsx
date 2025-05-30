import React from "react"

import cn from "../../../clsx"
import { CommonSelectStyles } from "./type"

export function CommonSelectButton({
  onClick,
  className,
  disabled,
  children,
}: {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
  className?: string
  disabled?: boolean
  children?: React.ReactNode
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={cn(CommonSelectStyles.ITEM, className)}>
      {children}
    </button>
  )
}
