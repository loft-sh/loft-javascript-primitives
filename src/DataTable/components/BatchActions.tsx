import { Table } from "@tanstack/react-table"
import React, { RefObject, useEffect, useRef, useState } from "react"

import cn from "../../../clsx"
import { Checkbox } from "../../Checkbox"
import { Tooltip } from "../../Tooltip"

type BatchActionsProps = {
  children: React.ReactNode
  table: Table<any>
  tooltipContentContainerClassName?: string
  isRowSelectable?: (row: any) => boolean
  containerRef?: RefObject<HTMLElement>
}

function BatchActions({
  children,
  table,
  tooltipContentContainerClassName,
  isRowSelectable = () => true,
  containerRef,
}: BatchActionsProps) {
  const selectableRows = table
    .getFilteredRowModel()
    .rows.filter((row) => isRowSelectable(row.original))

  const [visible, setVisible] = useState(true)

  const areAllSelectableRowsSelected = selectableRows.every((row) => row.getIsSelected())

  const tooltipRef = useRef<HTMLButtonElement>(null)

  // For tables in scrollable areas, we might need to hide the tooltip manually.
  // We can achieve this by observing an intersection of the scrollable area with the checkbox.
  useEffect(() => {
    const root = containerRef?.current
    const target = tooltipRef.current

    if (!root || !target) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const isIntersecting = entries.reduce((accum, curr) => accum && curr.isIntersecting, true)
        setVisible(isIntersecting)
      },
      {
        root,
        threshold: 1,
        rootMargin: "-75px 0px 34px 0px",
      }
    )

    observer.observe(target)

    return () => {
      observer.disconnect()
    }
  }, [containerRef, setVisible])

  return (
    <Tooltip
      content={
        <div className={cn("flex items-center gap-2 p-2", { hidden: !visible })}>{children}</div>
      }
      open={visible || !containerRef}
      className={tooltipContentContainerClassName}
      richTooltip
      arrow
      side="top"
      sideOffset={18}
      align="start"
      alignOffset={-16}>
      <Checkbox
        className="!translate-y-0.5"
        ref={tooltipRef}
        checked={
          areAllSelectableRowsSelected || (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(checked) => {
          const targetState = checked !== false
          selectableRows.forEach((row) => {
            if (row.getIsSelected() !== targetState) {
              row.toggleSelected()
            }
          })
        }}
        aria-label="Select all rows"
      />
    </Tooltip>
  )
}

export { BatchActions }
