import { ColumnDef } from "@tanstack/react-table"
import React from "react"

import { Checkbox } from "../../Checkbox"
import { Tooltip } from "../../Tooltip"
import { BatchActions, DeleteAction, SelectedCount } from "./BatchActions"
import { DeleteOutlined } from "@loft-enterprise/icons"

export function makeDeletionMultiSelectColumn<T>(
  isSelectable: (entity: T) => boolean,
  resourceName: string,
  onDelete: (selection: T[]) => Promise<void> | void,
  disabledCheckboxTooltipFn?: (entity: T) => string
): ColumnDef<T> {
  return {
    id: "select",
    enableResizing: false,
    header: ({ table }) => {
      const isSomethingSelected =
        table.getIsAllPageRowsSelected() || table.getIsSomePageRowsSelected()

      const selectableRows = table
        .getFilteredRowModel()
        .rows.filter((row) => isSelectable(row.original))

      const allSelectableSelected =
        selectableRows.length > 0 && selectableRows.every((row) => row.getIsSelected())

      const someSelectableSelected =
        selectableRows.some((row) => row.getIsSelected()) && !allSelectableSelected

      const selection = table.getSelectedRowModel().flatRows.map((row) => row.original)

      if (isSomethingSelected) {
        return (
          <BatchActions table={table} isRowSelectable={(row: T) => isSelectable(row)}>
            <SelectedCount count={selection.length} resourceName="Memberships" />

            <DeleteAction
              onClick={() => {
                onDelete(selection)
                table.resetRowSelection(false)
              }}>
              <DeleteOutlined /> Remove {resourceName.toLowerCase()}
            </DeleteAction>
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
      const disabled = !isSelectable(row.original)

      return (
        <div className={"flex h-full flex-col items-start justify-center"}>
          <Tooltip content={disabled ? disabledCheckboxTooltipFn?.(row.original) : undefined}>
            <Checkbox
              className={"-mt-0.5"}
              checked={row.getIsSelected()}
              disabled={disabled}
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
