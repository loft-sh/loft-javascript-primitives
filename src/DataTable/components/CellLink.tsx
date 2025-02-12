import React from "react"
import { Link } from "react-router-dom"

import cn from "../../../clsx"
import { CellResponsiveText } from "./CellResponsiveText"

type TCellLinkProps = {
  to: string | undefined
  children: React.ReactNode
  linkClassName?: string
  textClassName?: string
  tooltip?: string
}

export const CellLink = ({
  to,
  children,
  linkClassName,
  textClassName,
  tooltip,
}: TCellLinkProps) => {
  if (!to) {
    return <CellResponsiveText className={textClassName}>{children}</CellResponsiveText>
  }

  return (
    <Link
      onClick={(e) => e.stopPropagation()}
      className={cn(
        "truncate text-primary transition-colors hover:!text-primaryColor-dark group-hover:text-primaryColor-main",
        linkClassName
      )}
      to={to}>
      <CellResponsiveText className={textClassName} tooltip={tooltip}>
        {children}
      </CellResponsiveText>
    </Link>
  )
}
