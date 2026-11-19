import TableOutlined from "@ant-design/icons/TableOutlined"
import { Table } from "@tanstack/react-table"
import React from "react"

import { cn } from "../../cn-utils"
import { Button } from "../Button"
import { Checkbox } from "../Checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../DropdownMenu"
import { TABLE_BATCH_ACTIONS_COLUMN_ID, TABLE_EXPANSION_COLUMN_ID } from "./constants"

const UNLISTED_COLUMN_IDS = [TABLE_BATCH_ACTIONS_COLUMN_ID, TABLE_EXPANSION_COLUMN_ID, "actions"]

type Props<TData> = {
  disabled?: boolean
  table: Table<TData>
  displayNames?: Record<string, string>
}

function ColumnCustomization<TData>({ table, displayNames, disabled }: Props<TData>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" disabled={disabled}>
          <TableOutlined aria-hidden="true" /> Columns
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-max" side="bottom" align="end" sticky="always">
        {table
          .getAllLeafColumns()
          .filter((column) => !UNLISTED_COLUMN_IDS.includes(column.id))
          .map((column) => {
            const canHide = column.id !== "name" && column.getCanHide()

            return (
              <DropdownMenuCheckboxItem
                key={column.id}
                className="flex cursor-pointer select-none items-center gap-2 px-3 py-2 text-sm text-primary outline-none transition-colors focus-within:bg-neutral-light hover:bg-neutral-extra-light [&>span:first-child]:hidden"
                disabled={!canHide}
                checked={column.getIsVisible()}
                onCheckedChange={(checked) => column.toggleVisibility(checked)}
                onSelect={(event) => event.preventDefault()}>
                <Checkbox
                  aria-hidden="true"
                  tabIndex={-1}
                  checked={column.getIsVisible()}
                  disabled={!canHide}
                  className="pointer-events-none"
                />
                <span
                  className={cn("w-full whitespace-nowrap font-normal", {
                    capitalize: !displayNames?.[column.id],
                  })}>
                  {displayNames?.[column.id] ??
                    (typeof column.columnDef.header === "string"
                      ? column.columnDef.header
                      : column.id)}
                </span>
              </DropdownMenuCheckboxItem>
            )
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ColumnCustomization
