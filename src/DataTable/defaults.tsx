import { ColumnDef } from "@tanstack/react-table"
import React, { RefObject } from "react"

import { Button, ButtonStyles } from "../Button"
import { Checkbox } from "../Checkbox"
import { Tooltip } from "../Tooltip"
import { BatchActions } from "./components/BatchActions"
import { DeleteOutlined } from "@loft-enterprise/icons"
import { XOr } from "@loft-enterprise/shared"

type IsSelectableResult = XOr<
  {
    canSelect: true
  },
  {
    canSelect: false
    tooltip?: string
  }
>

type BatchAction<T> = {
  label: string
  icon?: React.ReactNode
  style?: ButtonStyles
  disabled?: (selection: T[]) => boolean
  onClick?: (selection: T[], e: React.MouseEvent<HTMLButtonElement>) => unknown
}

export type BatchActionColumnProps<T> = {
  /** Determines whether a row is selectable. Can optionally provide a tooltip for disabled checkboxes. */
  isSelectable?: (entity: T) => IsSelectableResult

  /** Display names for the resource type we're showing in the table. */
  resourceName?: {
    singular: string
    plural: string
  }

  /** Optionally, we can supply a ref to a scrollable container so the batch actions can be hidden on overflow. */
  containerRef?: RefObject<HTMLElement>

  /** The actions we want to offer as buttons. */
  actions: BatchAction<T>[]
}

export function makeBatchActionsColumn<T>({
  isSelectable = () => ({ canSelect: true }),
  resourceName,
  containerRef,
  actions,
}: BatchActionColumnProps<T>): ColumnDef<T> {
  return {
    id: "select",
    enableResizing: false,
    header: ({ table }) => {
      const isSomethingSelected =
        table.getIsAllPageRowsSelected() || table.getIsSomePageRowsSelected()

      const selectableRows = table
        .getFilteredRowModel()
        .rows.filter((row) => isSelectable(row.original).canSelect)

      const allSelectableSelected =
        selectableRows.length > 0 && selectableRows.every((row) => row.getIsSelected())

      const someSelectableSelected =
        selectableRows.some((row) => row.getIsSelected()) && !allSelectableSelected

      const selection = table.getSelectedRowModel().flatRows.map((row) => row.original)

      if (isSomethingSelected) {
        const count = selection.length
        const displayName = resourceName
          ? (count !== 1 ? resourceName.plural : resourceName.singular).toLowerCase()
          : ""

        return (
          <BatchActions
            containerRef={containerRef}
            table={table}
            isRowSelectable={(row: T) => isSelectable(row).canSelect}>
            <span className="whitespace-nowrap text-sm font-normal">
              {selection.length} {displayName} selected
            </span>

            {actions.map((action, index) => (
              <Button
                {...(action.style ?? {})}
                key={`${index}`}
                disabled={!!action.disabled?.(selection)}
                onClickAsync={async (e) => {
                  await action.onClick?.(selection, e)
                  table.resetRowSelection(false)
                }}>
                {action.icon} {action.label}
              </Button>
            ))}
          </BatchActions>
        )
      }

      return (
        <Checkbox
          className="!translate-y-0.5"
          checked={allSelectableSelected || (someSelectableSelected && "indeterminate")}
          onCheckedChange={(checked) => {
            const targetState = checked !== false
            selectableRows.forEach((row) => {
              if (row.getIsSelected() !== targetState) {
                row.toggleSelected()
              }
            })
          }}
          aria-label="Select all rows"
          disabled={selectableRows.length === 0}
        />
      )
    },
    cell: ({ row }) => {
      const selectable = isSelectable(row.original)

      return (
        <div className={"flex h-full flex-col items-start justify-center"}>
          <Tooltip content={selectable.tooltip}>
            <Checkbox
              className={"-mt-0.5"}
              checked={row.getIsSelected()}
              disabled={!selectable.canSelect}
              onClick={(e) => e.stopPropagation()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label="Select row"
            />
          </Tooltip>
        </div>
      )
    },
    size: 50,
    maxSize: 50,
  }
}

export function makeDeleteBatchAction<T>(
  onDelete?: (selection: T[], e: React.MouseEvent<HTMLButtonElement>) => unknown
): BatchAction<T> {
  return {
    label: "Delete",
    icon: <DeleteOutlined />,
    onClick: onDelete,
    style: {
      appearance: "danger",
      variant: "outlined",
    },
  }
}
