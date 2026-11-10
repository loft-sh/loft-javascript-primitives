import { createContext, RefObject } from "react"

export type DataTableContextValue = {
  tableRef: RefObject<HTMLTableElement>
}

export const DataTableContext = createContext<DataTableContextValue | undefined>(undefined)
