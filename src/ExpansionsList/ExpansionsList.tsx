import React, { forwardRef, useEffect, useId, useImperativeHandle, useState } from "react"

import { cn } from "../../cn-utils"
import { Add } from "../Add"
import { Input } from "../Input"
import { Tooltip } from "../Tooltip"
import { ExpansionsListContextProvider, useExpansionsListContext } from "./ExpansionsListContext"
import { CollapseIcon, DeleteOutlined, ExpandIcon } from "@loft-enterprise/icons"
import { XOr } from "@loft-enterprise/shared"

export type ExpansionsListProps = {
  className?: string
  children?: React.ReactNode
}

export type ExpansionsListItemInstance = {
  open: () => void
}

type ExpansionsListNameInputProps = {
  name?: string
  onNameChange?: (name: string) => void
  nameError?: string
  namePlaceholder?: string
  nameDisabled?: boolean
}

export type ExpansionsListItemProps = {
  className?: string
  children?: React.ReactNode
  onRemoveRequested?: () => void
} & XOr<{ customNameDisplay: React.ReactNode }, ExpansionsListNameInputProps>

export type ExpansionsListAddButtonProps = {
  className?: string
  label: React.ReactNode
  onAddRequested?: () => void
  tooltip?: string
  disabled?: boolean
}

export function ExpansionsList({ className, children }: ExpansionsListProps) {
  const [openItem, setOpenItem] = useState<string | null>(null)

  return (
    <ExpansionsListContextProvider openItem={openItem} setOpenItem={setOpenItem}>
      <div
        className={cn(
          "flex w-full flex-col overflow-hidden rounded-lg border border-divider-main bg-gray-5",
          "text-sm text-primary",
          className
        )}>
        {children}
      </div>
    </ExpansionsListContextProvider>
  )
}

export const ExpansionsListItem = forwardRef<ExpansionsListItemInstance, ExpansionsListItemProps>(
  function InnerExpansionsListItem({ className, children, ...props }, ref) {
    const id = useId()

    const { openItem, setOpenItem } = useExpansionsListContext()

    const isOpen = openItem === id

    useImperativeHandle(
      ref,
      () => ({
        open: () => {
          setOpenItem(id)
        },
      }),
      [id, setOpenItem]
    )

    useEffect(() => {
      return () => {
        setOpenItem((current) => (current === id ? null : current))
      }
    }, [id, setOpenItem])

    return (
      <div
        id={id}
        className={cn(
          "flex cursor-pointer select-none flex-col border-divider-main [&:not(:first-child)]:border-t",
          className
        )}
        onClick={() => setOpenItem(isOpen ? null : id)}>
        <div className="flex flex-shrink-0 flex-row items-center gap-2 overflow-hidden px-3 py-4">
          <Tooltip content={isOpen ? "Collapse" : "Expand"} wrappingTriggerDiv={false}>
            <div
              role="button"
              aria-label={isOpen ? "Collapse" : "Expand"}
              className={
                "flex cursor-pointer flex-col items-center justify-center p-2 transition-colors hover:text-neutral-light"
              }
              onClick={(e) => {
                e.stopPropagation()
                setOpenItem(isOpen ? null : id)
              }}>
              {isOpen ? (
                <CollapseIcon className="size-4 *:size-4" aria-hidden="true" />
              ) : (
                <ExpandIcon className="size-4 *:size-4" aria-hidden="true" />
              )}
            </div>
          </Tooltip>
          <div
            className="flex flex-grow cursor-auto flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}>
            {props.customNameDisplay ? (
              props.customNameDisplay
            ) : (
              <ExpansionsListNameInput
                name={props.name}
                onNameChange={props.onNameChange}
                nameError={props.nameError}
                namePlaceholder={props.namePlaceholder}
                nameDisabled={props.nameDisabled}
              />
            )}
          </div>
          {props.onRemoveRequested && (
            <Tooltip content="Remove" wrappingTriggerDiv={false}>
              <div
                role="button"
                aria-label="Remove"
                className={
                  "flex cursor-pointer flex-col items-center justify-center p-2 text-tertiary transition-colors hover:text-neutral-light"
                }
                onClick={(e) => {
                  e.stopPropagation()
                  setOpenItem(null)
                  props.onRemoveRequested?.()
                }}>
                <DeleteOutlined className="size-4 *:size-4" aria-hidden="true" />
              </div>
            </Tooltip>
          )}
        </div>
        {openItem === id && (
          <div className={"grid grid-cols-[1px,1fr] px-[52px] pb-5"}>
            <div className="w-[1px] flex-shrink-0 bg-divider-light"></div>
            <div
              className="grid cursor-auto grid-cols-[12px,max-content,max-content,1fr] gap-x-2 gap-y-3"
              onClick={(e) => e.stopPropagation()}>
              {children}
            </div>
          </div>
        )}
      </div>
    )
  }
)

export function ExpansionsListItemProperty({
  children,
  name,
  singleColumn,
  align = "center",
}: {
  children?: React.ReactNode
  name?: string
  align?: "top" | "center"
} & XOr<{ name: string }, { singleColumn: true }>) {
  const alignmentClass = cn("flex w-full flex-col justify-center", {
    "h-[30px]": align === "top",
    "h-full": align === "center",
  })

  return (
    <>
      <div className={alignmentClass}>
        <div className="h-[1px] w-full flex-shrink-0 bg-divider-light"></div>
      </div>
      {singleColumn ? (
        <div className={cn("col-span-3 flex flex-col", { "justify-center": align === "center" })}>
          {children}
        </div>
      ) : (
        <>
          <div className={cn(alignmentClass, "select-text text-secondary")}>{name}</div>
          <div className={cn(alignmentClass, "text-secondary")}>:</div>
          <div
            className={cn("flex flex-col overflow-hidden", {
              "justify-center": align === "center",
            })}>
            {children}
          </div>
        </>
      )}
    </>
  )
}

export function ExpansionsListNameInput({
  name,
  onNameChange,
  nameError,
  namePlaceholder,
  nameDisabled,
}: ExpansionsListNameInputProps) {
  return (
    <Input
      type="text"
      value={name}
      onChange={(e) => onNameChange?.(e.target.value)}
      placeholder={namePlaceholder}
      disabled={nameDisabled}
      error={!!nameError}
      statusText={nameError}
    />
  )
}

export function ExpansionsListAddButton({
  label,
  onAddRequested,
  className,
  tooltip,
  disabled,
}: ExpansionsListAddButtonProps) {
  return (
    <Tooltip content={tooltip} wrappingTriggerDiv={false}>
      <div className={cn("border-divider-main bg-white [&:not(:first-child)]:border-t", className)}>
        <Add borderless label={label} onAddRequested={onAddRequested} disabled={disabled} />
      </div>
    </Tooltip>
  )
}
