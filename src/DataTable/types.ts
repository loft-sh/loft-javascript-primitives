import type { ColumnDef, Row, RowData } from "@tanstack/react-table"
import type { ComponentType, ReactNode } from "react"

export type ExtendedColumnDef<TData extends RowData> = ColumnDef<TData> & {
  sortOnClick?: boolean
  cellClassName?: string
}

export type CustomRowContextProps<TData extends RowData> = {
  row: Row<TData>
  children: ReactNode
}

export type CustomRowContext<TData extends RowData> = ComponentType<CustomRowContextProps<TData>>

export type ExpansionComponentProps<TData extends RowData> = {
  row: Row<TData>
}

export type ExpansionComponent<TData extends RowData> = ComponentType<
  ExpansionComponentProps<TData>
>
