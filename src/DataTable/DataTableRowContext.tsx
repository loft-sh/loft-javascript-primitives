import { createContext } from "react"

export type TableRowContextOptions = {
  hoveredRow?: string
  rowId?: string
}

export const DataTableRowContext = createContext<TableRowContextOptions | undefined>(undefined)
