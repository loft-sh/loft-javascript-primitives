import { Table } from "@tanstack/react-table"
import React, { RefObject, useContext, useEffect, useRef, useState } from "react"

import cn from "../../../clsx"
import { Checkbox } from "../../Checkbox"
import { Tooltip } from "../../Tooltip"
import { DataTableContext } from "../DataTableContext"

type BatchActionsProps = {
  children: React.ReactNode
  table: Table<any>
  tooltipContentContainerClassName?: string
  isRowSelectable?: (row: any) => boolean
  containerRef?: RefObject<HTMLElement>
}

export function BatchActions({
  children,
  table,
  tooltipContentContainerClassName,
  isRowSelectable = () => true,
  containerRef,
}: BatchActionsProps) {
  const { tableRef } = useContext(DataTableContext) ?? {}

  const selectableRows = table
    .getFilteredRowModel()
    .rows.filter((row) => isRowSelectable(row.original))

  const [intersectingContainer, setIntersectingContainer] = useState(true)
  const [intersectingTable, setIntersectingTable] = useState(true)

  const areAllSelectableRowsSelected = selectableRows.every((row) => row.getIsSelected())

  const checkboxRef = useRef<HTMLButtonElement>(null)

  // For tables in scrollable areas, we might need to hide the tooltip manually.
  // We can achieve this by observing an intersection of the scrollable area with the checkbox.
  useEffect(() => {
    const container = containerRef?.current
    const checkbox = checkboxRef.current
    const table = tableRef?.current

    const cleanupContainer = attachContainerIntersectionObserver(
      checkbox,
      container,
      setIntersectingContainer
    )

    const cleanupTable = attachTableIntersectionObserver(checkbox, table, setIntersectingTable)

    return () => {
      cleanupContainer?.()
      cleanupTable?.()
    }
  }, [containerRef, setIntersectingContainer, tableRef])

  const visible = intersectingContainer && intersectingTable

  return (
    <div className={"flex h-full flex-col items-start justify-center"}>
      <Tooltip
        content={
          <div className={cn("flex items-center gap-2 p-2", { hidden: !visible })}>{children}</div>
        }
        open={visible || !containerRef}
        wrappingTriggerDiv={false}
        className={tooltipContentContainerClassName}
        richTooltip
        arrow
        side="top"
        sideOffset={18}
        align="start"
        alignOffset={-16}>
        <Checkbox
          ref={checkboxRef}
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
    </div>
  )
}

function attachContainerIntersectionObserver(
  checkbox: HTMLElement | null | undefined,
  container: HTMLElement | null | undefined,
  setIntersecting: (intersecting: boolean) => void
) {
  if (!checkbox || !container) {
    return undefined
  }

  const observer = new IntersectionObserver(
    (entries) => {
      const isIntersecting = entries.reduce((accum, curr) => accum && curr.isIntersecting, true)
      setIntersecting(isIntersecting)
    },
    {
      root: container,
      threshold: 1,
      rootMargin: "-75px 0px 34px 0px",
    }
  )

  observer.observe(checkbox)

  return () => {
    observer.disconnect()
  }
}

function attachTableIntersectionObserver(
  checkbox: HTMLElement | null | undefined,
  table: HTMLElement | null | undefined,
  setIntersecting: (intersecting: boolean) => void
) {
  if (!checkbox || !table) {
    return undefined
  }

  const observer = new IntersectionObserver(
    (entries) => {
      const isIntersecting = entries.reduce((accum, curr) => accum && curr.isIntersecting, true)
      setIntersecting(isIntersecting)
    },
    {
      root: table,
      threshold: 1,
      rootMargin: "0px 0px 0px 0px",
    }
  )

  observer.observe(checkbox)

  return () => {
    observer.disconnect()
  }
}
