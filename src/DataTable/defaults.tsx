import { CellContext, ColumnDef, FilterFn, SortingFn } from "@tanstack/react-table"
import type { LocationDescriptor } from "history"
import React, { RefObject } from "react"
import { Link } from "react-router-dom"

import { Button, ButtonStyles } from "../Button"
import { Checkbox } from "../Checkbox"
import { Chip } from "../Chip"
import { Tooltip } from "../Tooltip"
import { BatchActions } from "./components/BatchActions"
import { CellResponsiveText } from "./components/CellResponsiveText"
import { ColumnHeader } from "./components/ColumnHeader"
import { TableNameCell } from "./components/TableNameCell"
import { TABLE_BATCH_ACTIONS_COLUMN_ID } from "./constants"
import type { ExtendedColumnDef } from "./DataTable"
import { DeleteOutlined } from "@loft-enterprise/icons"
import { TenantObject, XOr } from "@loft-enterprise/shared"

type IsSelectableResult = XOr<
  {
    canSelect: true
  },
  {
    canSelect: false
    tooltip?: string
    hideCheckbox?: boolean
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
          <TableNameCell.Main offsetForId={Boolean(id)}>
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

export type TenantColumnProps<T> = {
  getTenantDisplayName: (tenantName: string) => string
  getTenantObject: (row: T) => TenantObject
  filterFn?: FilterFn<T>
  size?: number
}

export function makeTenantColumn<T>({
  getTenantDisplayName,
  getTenantObject,
  filterFn,
  size = 150,
}: TenantColumnProps<T>): DefaultColumnDef<T> {
  const getTenantName = (row: T) => {
    return getTenantObject(row).metadata?.labels?.["tenant.vcluster.com/owner"]
  }

  return {
    id: "tenant",
    header: "Tenant",
    accessorFn: getTenantName,
    cell: ({ row: { original } }) => {
      const tenantName = getTenantName(original)

      if (tenantName == null) {
        return <CellResponsiveText>-</CellResponsiveText>
      }

      return (
        <CellResponsiveText tooltip={tenantName}>
          {getTenantDisplayName(tenantName)}
        </CellResponsiveText>
      )
    },
    filterFn:
      filterFn ??
      ((row, _id, filterValue: string | null | undefined) => {
        if (filterValue == null) {
          return true
        }

        return getTenantName(row.original) === filterValue
      }),
    size,
  }
}

export function makeTenantAssignmentColumn<T>({
  getTenantDisplayName,
  getTenantObject,
  size = 180,
}: {
  getTenantDisplayName: (tenantName: string) => string
  getTenantObject: (row: T) => TenantObject
  size?: number
}): DefaultColumnDef<T> {
  const getTenantName = (row: T) => {
    const labels = getTenantObject(row).metadata?.labels

    return labels?.["tenant.vcluster.com/exclusive-to"] ?? labels?.["tenant.vcluster.com/owner"]
  }

  return {
    id: "tenantAssignment",
    header: "Tenant Assignment",
    accessorFn: (row) => {
      const tenant = getTenantName(row)

      return tenant != null ? getTenantDisplayName(tenant) : ""
    },
    cell: ({ row: { original } }) => {
      const tenant = getTenantName(original)
      if (tenant == null) {
        return <span className="text-sm italic text-tertiary">Unassigned</span>
      }

      return <Chip appearance="neutral">{getTenantDisplayName(tenant)}</Chip>
    },
    size,
  }
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
}: BatchActionColumnProps<T>): ExtendedColumnDef<T> {
  return {
    id: TABLE_BATCH_ACTIONS_COLUMN_ID,
    enableResizing: false,
    header: ({ table }) => {
      const selectableRows = table
        .getFilteredRowModel()
        .flatRows.filter((row) => isSelectable(row.original).canSelect)
      const pageRows = table
        .getRowModel()
        .flatRows.filter((row) => isSelectable(row.original).canSelect)
      const allPageSelected = pageRows.length > 0 && pageRows.every((row) => row.getIsSelected())
      const somePageSelected = pageRows.some((row) => row.getIsSelected()) && !allPageSelected

      const selection = table
        .getFilteredSelectedRowModel()
        .flatRows.filter((row) => isSelectable(row.original).canSelect)
        .map((row) => row.original)
      const selectableCount = selectableRows.length
      const allSelected = selection.length === selectableCount
      const noun =
        resourceName?.[selection.length === 1 ? "singular" : "plural"].toLowerCase() ??
        (selection.length === 1 ? "item" : "items")
      const handleSelectPage = (checked: boolean | "indeterminate") => {
        if (checked === false && allSelected) {
          table.resetRowSelection(false)

          return
        }
        table.setRowSelection((previous) => {
          const next = { ...previous }
          pageRows.forEach((row) => {
            if (checked === false) delete next[row.id]
            else next[row.id] = true
          })

          return next
        })
      }

      const checkboxProps: React.ComponentProps<typeof Checkbox> = {
        className: "relative before:absolute before:-inset-2 before:content-['']",
        checked: allPageSelected || (somePageSelected && "indeterminate"),
        onCheckedChange: handleSelectPage,
        "aria-label": "Select this page",
        disabled: pageRows.length === 0,
      }

      if (selection.length > 0) {
        return (
          <BatchActions containerRef={containerRef} checkboxProps={checkboxProps}>
            <div className="flex flex-col gap-6 p-2">
              <span className="whitespace-nowrap text-sm font-normal">
                {allSelected && "All "}
                <span className="font-semibold">{selection.length}</span> {noun} selected.
                {!allSelected && (
                  <>
                    {" "}
                    <Button
                      variant="link"
                      appearance="primary"
                      className="p-0 font-semibold no-underline"
                      onClick={() =>
                        table.setRowSelection(
                          Object.fromEntries(selectableRows.map((row) => [row.id, true]))
                        )
                      }>
                      Select All {selectableCount}
                    </Button>
                  </>
                )}
              </span>
              <div className="flex justify-end gap-2">
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
              </div>
            </div>
          </BatchActions>
        )
      }

      return (
        <div className={"flex h-full flex-col items-start justify-center"}>
          <Checkbox {...checkboxProps} />
        </div>
      )
    },
    cell: ({ row }) => {
      const selectable = isSelectable(row.original)
      if (!selectable.canSelect && selectable.hideCheckbox) {
        return null
      }

      return (
        <div className={"flex h-full flex-col items-start justify-center"}>
          <Tooltip content={selectable.tooltip} wrappingTriggerDiv={false}>
            <Checkbox
              className={"relative -mt-0.5 before:absolute before:-inset-2 before:content-['']"}
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
