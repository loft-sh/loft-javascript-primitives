import { motion } from "framer-motion"
import React, { forwardRef } from "react"

import { TableRow as NormalTableRow } from "../Table"

const TableRow = motion(NormalTableRow)

export const DataTableRow = forwardRef<
  HTMLTableRowElement,
  React.ComponentPropsWithoutRef<typeof TableRow>
>((props, ref) => (
  <TableRow
    ref={ref}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.05 }}
    {...props}
  />
))
DataTableRow.displayName = "DataTableRow"
