import React, { useEffect, useRef, useState } from "react"

import { cn } from "../cn-utils"
import { Button, type ButtonStyles } from "./Button"
import { IconButton } from "./IconButton"
import { Loading } from "./Loading"
import { Tooltip } from "./Tooltip"
import { EyeOutlined, InfoCircleOutlined, RightOutlined } from "@loft-enterprise/icons"
import { IconComponentFunction, useTruncateDetection, XOr } from "@loft-enterprise/shared"

export type SimpleTableLoadingState = {
  message?: string
  action?: {
    label: string
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => void
  }
}

export type SimpleTableRowAction = {
  style?: ButtonStyles
  disabled?: boolean
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
  tooltip?: string
} & XOr<
  { label?: string; icon: IconComponentFunction; ariaLabel: string },
  { label: string; icon?: IconComponentFunction; ariaLabel?: string }
>

export type SimpleTableRowData = {
  key: string
  value: React.ReactNode
  icon?: IconComponentFunction
  hidden?: boolean
  valueTooltip?: string
  actions?: SimpleTableRowAction[]
}

export type SimpleTableProps = {
  rows: SimpleTableRowData[]
  className?: string
  loadingState?: SimpleTableLoadingState
  error?: string
  emptyState?: React.ReactNode
}

function SimpleTableExceptionWrapper({
  className,
  children,
}: {
  children?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex h-28 flex-row items-center justify-center gap-2 rounded-b-md border border-divider-light text-secondary",
        className
      )}>
      {children}
    </div>
  )
}

export function SimpleTable({
  rows,
  className,
  loadingState,
  error,
  emptyState,
}: SimpleTableProps) {
  if (loadingState) {
    return (
      <SimpleTableExceptionWrapper className={className}>
        <Loading
          className={"!size-4 *:size-4"}
          spinnerClassName={"!text-secondary"}
          variant={"pronounced"}
        />
        {loadingState.message ?? "Loading..."}
        {loadingState.action && (
          <Button variant={"ghost"} onClick={loadingState.action.onClick}>
            {loadingState.action.label} <RightOutlined className={"size-4 *:size-4"} />
          </Button>
        )}
      </SimpleTableExceptionWrapper>
    )
  }

  if (error) {
    return (
      <SimpleTableExceptionWrapper className={className}>
        <InfoCircleOutlined className={"size-4 *:size-4"} />
        {error}
      </SimpleTableExceptionWrapper>
    )
  }

  if (rows.length === 0) {
    return (
      <SimpleTableExceptionWrapper
        className={cn("!h-auto min-h-28 flex-col py-8 text-primary", className)}>
        {emptyState ?? "No data"}
      </SimpleTableExceptionWrapper>
    )
  }

  return (
    <div
      role="table"
      className={cn(
        "flex w-full flex-col overflow-hidden rounded-md border border-divider-light",
        className
      )}>
      {rows.map((r, index) => (
        <SimpleTableRow key={r.key} row={r} isLastRow={index >= rows.length - 1} />
      ))}
    </div>
  )
}

function SimpleTableRow({ row, isLastRow }: { row: SimpleTableRowData; isLastRow: boolean }) {
  const [visible, setVisible] = useState(!row.hidden)
  const RowIcon = row.icon

  const keyRef = useRef<HTMLDivElement>(null)
  const valueRef = useRef<HTMLSpanElement>(null)

  const keyTruncated = useTruncateDetection(keyRef)
  const valueTruncated = useTruncateDetection(valueRef)

  useEffect(() => {
    setVisible(!row.hidden)
  }, [row.hidden])

  const hasRowActions = (row.actions?.length ?? 0) > 0
  const showActionsOverlay = row.hidden || hasRowActions

  return (
    <div
      role="row"
      className={cn("group relative box-border flex flex-row items-center overflow-hidden py-3", {
        "border-b border-b-divider-light": !isLastRow,
      })}>
      <div
        role="cell"
        className={"flex w-1/2 flex-shrink-0 flex-row items-center gap-2 overflow-hidden px-2"}>
        {RowIcon && (
          <div className={"h-fit text-secondary"}>
            <RowIcon className={"size-6 *:size-6"} aria-hidden="true" />
          </div>
        )}
        <Tooltip wrappingTriggerDiv={false} content={keyTruncated ? row.key : undefined}>
          <div className={"truncate"} ref={keyRef}>
            {row.key}
          </div>
        </Tooltip>
      </div>
      <div
        role="cell"
        className={"flex w-1/2 flex-shrink-0 flex-row items-center overflow-hidden px-2 text-xs"}>
        <Tooltip
          wrappingTriggerDiv={false}
          content={valueTruncated && visible ? row.valueTooltip : undefined}>
          <span className={"block truncate"} ref={valueRef}>
            {visible ? row.value : <span className={"text-sm"}>{`\u2022`.repeat(9)}</span>}
          </span>
        </Tooltip>
      </div>

      {showActionsOverlay && (
        <div
          className={"absolute right-0 top-0 hidden h-full flex-row items-center group-hover:flex"}>
          <div className={"h-full w-10 bg-gradient-to-r from-white/0 to-white/100 to-80%"}></div>
          <div
            className={
              "flex h-full flex-row items-center gap-2 bg-white px-2 text-xs backdrop-blur-lg"
            }>
            {row.hidden && (
              <Tooltip wrappingTriggerDiv={false} content={"Toggle visibility"}>
                <IconButton
                  size={"small"}
                  appearance={"ghost"}
                  onClick={(e) => {
                    e.stopPropagation()
                    e.currentTarget.blur()
                    setVisible((v) => !v)
                  }}>
                  <EyeOutlined />
                </IconButton>
              </Tooltip>
            )}
            {row.actions?.map((action, actionIndex) => {
              const Icon = action.icon

              return (
                <Tooltip key={actionIndex} wrappingTriggerDiv={false} content={action.ariaLabel}>
                  <Button
                    type={"button"}
                    aria-label={action.ariaLabel}
                    size={"small"}
                    variant={"ghost"}
                    className={cn({ "px-1": !action.label })}
                    appearance={"neutral"}
                    {...(action.style ?? {})}
                    disabled={action.disabled}
                    onClick={(e) => {
                      e.stopPropagation()
                      action.onClick?.(e)
                    }}>
                    {Icon && <Icon className={"size-3 *:size-3"} aria-hidden="true" />}
                    {action.label}
                  </Button>
                </Tooltip>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
