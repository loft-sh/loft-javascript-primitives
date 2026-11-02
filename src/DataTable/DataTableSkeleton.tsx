import React from "react"

import { Skeleton } from "../Skeleton"
import { TableCell, TableRow } from "../Table"

const mockColumns = [
  { id: "select", header: "", size: 10 },
  { id: "name", header: "Name", size: 250 },
  { id: "namespace", header: "Namespace", size: 150 },
  { id: "age", header: "Age", size: 100 },
  { id: "actions", header: "", size: 100 },
]

function DataTableSkeleton({
  columns,
  rows = 6,
  variant = "default",
}: {
  columns: number
  rows?: number
  variant?: "default" | "slim"
}) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <TableRow key={rowIndex}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <TableCell key={colIndex} variant={variant} className="py-2">
              <Skeleton className="h-4 w-full" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  )
}

export { DataTableSkeleton, mockColumns }
