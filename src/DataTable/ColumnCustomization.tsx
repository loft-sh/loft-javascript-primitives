import { Table } from "@tanstack/react-table"
import React from "react"

import { SettingOutlined } from "@loft-enterprise/icons"
import {
  Button,
  Checkbox,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Label,
} from "@loft-enterprise/primitives"

type Props<TData> = {
  table: Table<TData>
}

function ColumnCustomization<TData>({ table }: Props<TData>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost">
          <SettingOutlined /> Columns
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="max-w-36" side="bottom" align="end" sticky="always">
        <div>
          {table.getAllLeafColumns().map((column) => {
            if (column.id === "select" || column.id === "actions") return null

            return (
              <DropdownMenuItem
                onKeyDown={(e) => {
                  if (column.id === "name") return
                  if (e.key === "Enter" || e.key === " ") {
                    const mockEvent = {
                      target: {
                        checked: !column.getIsVisible(),
                      },
                    }
                    column.getToggleVisibilityHandler()(mockEvent)
                  }
                }}
                onClick={(e) => {
                  if (column.id === "name") return
                  e.preventDefault()
                  const mockEvent = {
                    target: {
                      checked: !column.getIsVisible(),
                    },
                  }
                  column.getToggleVisibilityHandler()(mockEvent)
                }}
                key={column.id}
                onSelect={(e) => e.preventDefault()}>
                <div key={column.id}>
                  <div className="flex w-full items-center gap-2">
                    <Checkbox
                      className="*:ml-[3px]"
                      id={column.id}
                      disabled={column.id === "name"}
                      checked={column.getIsVisible()}
                      onCheckedChange={(e) => {
                        const mockEvent = {
                          target: {
                            checked: e,
                          },
                        }
                        column.getToggleVisibilityHandler()(mockEvent)
                      }}
                    />
                    <Label htmlFor={column.id} className="w-full text-sm">
                      <span className="capitalize">{column.id}</span>
                    </Label>
                  </div>
                </div>
              </DropdownMenuItem>
            )
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ColumnCustomization
