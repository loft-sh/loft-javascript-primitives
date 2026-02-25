import { createContext } from "react"

export type TableRowContextOptions = {
  isHovered?: boolean
}

export const DataTableRowContext = createContext<TableRowContextOptions | undefined>(undefined)
