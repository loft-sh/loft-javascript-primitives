import { Table } from "@tanstack/react-table"
import React from "react"

import { RetweetOutlined } from "@loft-enterprise/icons"
import { Button, Checkbox, Tooltip } from "@loft-enterprise/primitives"

type BatchActionsProps = {
  children: React.ReactNode
  table: Table<any>
  tooltipContentContainerClassName?: string
  isRowSelectable?: (row: any) => boolean
}

function BatchActions({
  children,
  table,
  tooltipContentContainerClassName,
  isRowSelectable = () => true,
}: BatchActionsProps) {
  const selectableRows = table
    .getFilteredRowModel()
    .rows.filter((row) => isRowSelectable(row.original))

  const areAllSelectableRowsSelected = selectableRows.every((row) => row.getIsSelected())

  return (
    <Tooltip
      content={<div className={"flex items-center gap-2 p-2"}>{children}</div>}
      open
      className={tooltipContentContainerClassName}
      richTooltip
      arrow
      side="top"
      sideOffset={18}
      align="start"
      alignOffset={-16}>
      <Checkbox
        className="!translate-y-0.5"
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

type SelectedCountProps = {
  count: number
  resourceName: string
}

function SelectedCount({ count }: SelectedCountProps) {
  return <span className="whitespace-nowrap font-normal">{count} selected</span>
}

type DeleteActionProps = {
  onClick: () => void
  children?: React.ReactNode
}

function DeleteAction({ onClick, children }: DeleteActionProps) {
  return (
    <Button appearance="danger" variant="outlined" className="font-semibold" onClick={onClick}>
      {children}
    </Button>
  )
}

type MoveActionProps = {
  onMove: () => void
  disabled?: boolean
  children?: React.ReactNode
}

function MoveAction({ onMove, disabled, children }: MoveActionProps) {
  if (disabled) return null

  return (
    <Button className="font-semibold" variant="outlined" onClick={onMove}>
      {children || (
        <>
          <RetweetOutlined /> Move to Project
        </>
      )}
    </Button>
  )
}

export { BatchActions, SelectedCount, DeleteAction, MoveAction }
