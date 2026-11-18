import React from "react"

import { cn } from "../../cn-utils"
import { Add } from "../Add"

export type ObjectListProps = {
  children?: React.ReactNode
  addLabel?: React.ReactNode
  onAdd?: () => void
}

export function ObjectList({ children, addLabel = "Create", onAdd }: ObjectListProps) {
  const items = React.Children.toArray(children)

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-divider-main bg-white text-sm text-primary">
      {items.length > 0 && <ul className="m-0">{items}</ul>}
      {onAdd && (
        <div className="border-divider-main [&:not(:first-child)]:border-t">
          <Add borderless label={addLabel} onAddRequested={() => onAdd()} />
        </div>
      )}
    </div>
  )
}

export type ObjectListItemProps = {
  children?: React.ReactNode
  onClick?: () => void
}

export function ObjectListItem({ children, onClick }: ObjectListItemProps) {
  return (
    <li
      className={cn(
        "flex min-h-8 flex-row items-center gap-4 border-b border-divider-main px-4 py-2 last:border-b-0",
        {
          "cursor-pointer": !!onClick,
        }
      )}
      onClick={onClick}>
      {children}
    </li>
  )
}
