import React, { ReactNode } from "react"

import { MorphedButton } from "../../MorphedButton"
import { CheckOutlined, CopyOutlined } from "@loft-enterprise/icons"

// Root component
interface NameCellRootProps {
  children: ReactNode
  className?: string
}

const NameCellRoot: React.FC<NameCellRootProps> = ({ children, className = "" }) => {
  return <div className={`flex flex-col gap-[1px] [--id-height:20px] ${className}`}>{children}</div>
}

// Main content area
interface NameCellMainProps {
  children: ReactNode
}

const NameCellMain: React.FC<NameCellMainProps> = ({ children }) => {
  return (
    <div className="relative flex w-full translate-y-[calc(var(--id-height)/2+1px)] flex-row items-center gap-2 text-sm transition-all group-hover:translate-y-0">
      {children}
    </div>
  )
}

// Copyable ID component
interface NameCellCopyableProps {
  children: ReactNode
  id: string
}

const NameCellCopyable: React.FC<NameCellCopyableProps> = ({ children, id }) => (
  <MorphedButton
    className="h-[--id-height] text-secondary opacity-0 transition-all duration-300 hover:bg-transparent hover:text-primary focus:bg-transparent focus:text-primary active:text-primary group-hover:opacity-100"
    from={<CopyOutlined />}
    to={<CheckOutlined />}
    variant="ghost"
    size="small"
    tooltip={<span>Copy to clipboard</span>}
    onClick={(e) => {
      e.stopPropagation()
      navigator.clipboard.writeText(id)
    }}>
    <span className="h-[--id-height] cursor-pointer truncate text-xs font-normal text-tertiary opacity-0 transition-all duration-300 group-hover:opacity-100">
      {children}
    </span>
  </MorphedButton>
)

export const TableNameCell = {
  Root: NameCellRoot,
  Main: NameCellMain,
  Copyable: NameCellCopyable,
}
