import { createContext } from "react"

export type TableRowContextOptions = {
  isHovered?: boolean
  isActionMenuOpen?: boolean
  setActionMenuOpen?: (open: boolean) => void
}

export const DataTableRowContext = createContext<TableRowContextOptions | undefined>(undefined)
