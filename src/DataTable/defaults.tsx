import { CellContext, ColumnDef, FilterFn, SortingFn } from "@tanstack/react-table"
import type { LocationDescriptor } from "history"
import React, { RefObject } from "react"
import { Link } from "react-router-dom"

import { Button, ButtonStyles } from "../Button"
import { Checkbox } from "../Checkbox"
import { Tooltip } from "../Tooltip"
import { BatchActions } from "./components/BatchActions"
import { CellResponsiveText } from "./components/CellResponsiveText"
import { ColumnHeader } from "./components/ColumnHeader"
import { TableNameCell } from "./components/TableNameCell"
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
  Icon?: React.ComponentType<{ className?: string }>
  style?: ButtonStyles
  disabled?: (selection: T[]) => boolean
  onClick?: (selection: T[], e: React.MouseEvent<HTMLButtonElement>) => unknown
}

type DefaultColumnDef<T> = ColumnDef<T> & {
  sortOnClick?: boolean
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

type NameColumnBase<T> = {
  getName: (row: T) => React.ReactNode
  getId?: (row: T) => string | undefined
  getCopyLabel?: (row: T) => React.ReactNode
  /** Override the sort/filter accessor; defaults to `getName`. */
  accessorFn?: (row: T) => unknown
  /** Inline trailing slot rendered after the name (icons, badges). */
  renderBadges?: (row: T) => React.ReactNode
  /** Escape hatch — when set, replaces the entire name body and bypasses link/onClick/badges. */
  renderName?: (row: T, cell: CellContext<T, unknown>) => React.ReactNode
  filterFn?: FilterFn<T>
  sortingFn?: SortingFn<T>
  sortOnClick?: boolean
  size?: number
  minSize?: number
  rootClassName?: string
  header?: React.ReactNode
}

export type NameColumnProps<T> = NameColumnBase<T> &
  XOr<
    { link?: (row: T) => LocationDescriptor<unknown> | undefined },
    { onClick?: (row: T, e: React.MouseEvent) => void }
  >

export type NameTextColumnProps<T> = {
  accessorFn: (row: T) => unknown
  getName: (row: T) => React.ReactNode
  renderName?: (row: T, cell: CellContext<T, unknown>) => React.ReactNode
  filterFn?: FilterFn<T>
  sortingFn?: SortingFn<T>
  sortOnClick?: boolean
  sortable?: boolean
  size?: number
  minSize?: number
  className?: string
  header?: string
}

export function makeNameColumn<T>(props: NameColumnProps<T>): DefaultColumnDef<T> {
  const {
    accessorFn,
    getName,
    getId,
    getCopyLabel,
    renderBadges,
    renderName,
    filterFn,
    sortingFn,
    sortOnClick,
    size = 250,
    minSize,
    rootClassName,
    header = "Name",
    link,
    onClick,
  } = props

  return {
    id: "name",
    sortOnClick,
    accessorFn: accessorFn ?? ((row: T) => getName(row)),
    header: ({ column }) => (
      <ColumnHeader column={column} sortable={true}>
        {header}
      </ColumnHeader>
    ),
    cell: (cell) => {
      const original = cell.row.original
      const id = getId?.(original)
      const copyLabel = getCopyLabel?.(original) ?? (id ? `id: ${id}` : null)

      return (
        <TableNameCell.Root className={rootClassName}>
          <TableNameCell.Main>
            {renderName ? (
              renderName(original, cell)
            ) : (
              <>
                <NameBody row={original} getName={getName} link={link} onClick={onClick} />
                {renderBadges?.(original)}
              </>
            )}
          </TableNameCell.Main>

          {id && copyLabel != null && (
            <TableNameCell.Copyable id={id}>{copyLabel}</TableNameCell.Copyable>
          )}
        </TableNameCell.Root>
      )
    },
    ...(filterFn ? { filterFn } : {}),
    ...(sortingFn ? { sortingFn } : {}),
    size,
    minSize,
  }
}

function NameBody<T>({
  row,
  getName,
  link,
  onClick,
}: {
  row: T
  getName: (row: T) => React.ReactNode
  link?: (row: T) => LocationDescriptor<unknown> | undefined
  onClick?: (row: T, e: React.MouseEvent) => void
}) {
  const name = getName(row)
  const tooltip = typeof name === "string" ? name : undefined
  const text = (
    <CellResponsiveText
      wrappingTriggerDiv={false}
      className="truncate text-sm font-medium text-primary group-hover:text-primaryColor-main"
      tooltip={tooltip}>
      {name}
    </CellResponsiveText>
  )

  if (link) {
    const to = link(row)
    if (to) {
      return (
        <Link className="min-w-0 max-w-full" to={to} onClick={(e) => e.stopPropagation()}>
          {text}
        </Link>
      )
    }

    return text
  }

  if (onClick) {
    return (
      <button
        type="button"
        className="min-w-0 max-w-full cursor-pointer"
        onClick={(e) => {
          e.stopPropagation()
          onClick(row, e)
        }}>
        {text}
      </button>
    )
  }

  return text
}

export function makeNameTextColumn<T>({
  accessorFn,
  getName,
  renderName,
  filterFn,
  sortingFn,
  sortOnClick,
  sortable = true,
  size = 200,
  minSize,
  className = "text-sm",
  header = "Name",
}: NameTextColumnProps<T>): DefaultColumnDef<T> {
  return {
    id: "name",
    sortOnClick,
    accessorFn,
    header: sortable
      ? ({ column }) => (
          <ColumnHeader column={column} sortable={true}>
            {header}
          </ColumnHeader>
        )
      : header,
    cell: (cell) => {
      const original = cell.row.original

      return (
        renderName?.(original, cell) ?? (
          <CellResponsiveText className={className}>{getName(original)}</CellResponsiveText>
        )
      )
    },
    ...(filterFn ? { filterFn } : {}),
    ...(sortingFn ? { sortingFn } : {}),
    size,
    minSize,
  }
}

export type StatusColumnProps<T> = {
  accessorFn?: (row: T) => unknown
  renderStatus: (row: T) => React.ReactNode
  sortable?: boolean
  filterFn?: FilterFn<T>
  sortingFn?: SortingFn<T>
  sortOnClick?: boolean
  size?: number
  minSize?: number
}

export function makeStatusColumn<T>({
  accessorFn,
  renderStatus,
  sortable = false,
  filterFn,
  sortingFn,
  sortOnClick,
  size,
  minSize,
}: StatusColumnProps<T>): DefaultColumnDef<T> {
  return {
    id: "status",
    sortOnClick,
    accessorFn,
    header: sortable
      ? ({ column }) => (
          <ColumnHeader column={column} sortable={true}>
            Status
          </ColumnHeader>
        )
      : "Status",
    cell: ({ row: { original } }) => renderStatus(original),
    ...(filterFn ? { filterFn } : {}),
    ...(sortingFn ? { sortingFn } : {}),
    size,
    minSize,
  }
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
        .getRowModel()
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
                {action.Icon && <action.Icon />} {action.label}
              </Button>
            ))}
          </BatchActions>
        )
      }

      return (
        <div className={"flex h-full flex-col items-start justify-center"}>
          <Checkbox
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
        </div>
      )
    },
    cell: ({ row }) => {
      const selectable = isSelectable(row.original)

      return (
        <div className={"flex h-full flex-col items-start justify-center"}>
          <Tooltip content={selectable.tooltip} wrappingTriggerDiv={false}>
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
    Icon: DeleteOutlined,
    onClick: onDelete,
    style: {
      appearance: "danger",
      variant: "outlined",
    },
  }
}
