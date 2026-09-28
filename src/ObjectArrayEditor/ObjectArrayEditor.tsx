import React, { forwardRef, useEffect, useId, useImperativeHandle, useRef, useState } from "react"

import { cn } from "../../cn-utils"
import { Add } from "../Add"
import { Input } from "../Input"
import { Tooltip } from "../Tooltip"
import {
  ObjectArrayEditorContextProvider,
  useObjectArrayEditorContext,
} from "./ObjectArrayEditorContext"
import {
  CollapseIcon,
  DeleteOutlined,
  ExpandIcon,
  MinusSquareOutlined,
} from "@loft-enterprise/icons"
import { XOr } from "@loft-enterprise/shared"

export type ObjectArrayEditorProps = {
  className?: string
  children?: React.ReactNode
}

export type ObjectArrayEditorItemInstance = {
  open: (focusName?: boolean) => void
}

type ObjectArrayEditorItemNameInputProps = {
  name?: string
  onNameChange?: (name: string) => void
  nameError?: string
  namePlaceholder?: string
  nameDisabled?: boolean
}

export type ObjectArrayEditorItemProps = {
  className?: string
  children?: React.ReactNode
  onRemoveRequested?: () => void
  propertyColumnsClassName?: string
  noExpansion?: boolean
  headerClassName?: string
  removeLabel?: React.ReactNode
} & XOr<{ customNameDisplay: React.ReactNode }, ObjectArrayEditorItemNameInputProps>

export type ObjectArrayEditorAddButtonProps = {
  className?: string
  label: React.ReactNode
  onAddRequested?: () => void
  tooltip?: string
  disabled?: boolean
}

export function ObjectArrayEditor({ className, children }: ObjectArrayEditorProps) {
  const [openItem, setOpenItem] = useState<string | null>(null)

  return (
    <ObjectArrayEditorContextProvider openItem={openItem} setOpenItem={setOpenItem}>
      <div
        className={cn(
          "flex w-full flex-col overflow-hidden rounded-lg border border-divider-main bg-gray-5",
          "text-sm text-primary",
          className
        )}>
        {children}
      </div>
    </ObjectArrayEditorContextProvider>
  )
}

export const ObjectArrayEditorItem = forwardRef<
  ObjectArrayEditorItemInstance,
  ObjectArrayEditorItemProps
>(function InnerObjectArrayEditorItem(
  {
    className,
    children,
    propertyColumnsClassName,
    noExpansion,
    headerClassName,
    removeLabel,
    ...props
  },
  ref
) {
  const id = useId()

  const { openItem, setOpenItem } = useObjectArrayEditorContext()

  const nameInputRef = useRef<HTMLInputElement>(null)

  const isOpen = noExpansion || openItem === id

  useImperativeHandle(
    ref,
    () => ({
      open: (focusName = true) => {
        if (!noExpansion) {
          setOpenItem(id)
        }
        if (focusName) {
          nameInputRef.current?.focus()
        }
      },
    }),
    [id, noExpansion, setOpenItem]
  )

  useEffect(() => {
    if (noExpansion) {
      return
    }

    return () => {
      setOpenItem((current) => (current === id ? null : current))
    }
  }, [id, noExpansion, setOpenItem])

  const requestRemove = (event: React.SyntheticEvent) => {
    event.stopPropagation()

    if (!noExpansion) {
      setOpenItem(null)
    }

    props.onRemoveRequested?.()
  }

  return (
    <div
      id={id}
      className={cn(
        "flex flex-col border-divider-main [&:not(:first-child)]:border-t",
        !noExpansion && "cursor-pointer select-none",
        className
      )}
      onClick={noExpansion ? undefined : () => setOpenItem(isOpen ? null : id)}>
      <div
        className={cn(
          "flex flex-shrink-0 flex-row items-center gap-2 overflow-hidden px-3 py-4",
          {
            "px-4": noExpansion,
          },
          headerClassName
        )}>
        {!noExpansion && (
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
        )}
        <div
          className="flex flex-grow cursor-auto flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}>
          {props.customNameDisplay ? (
            props.customNameDisplay
          ) : (
            <ObjectArrayEditorItemNameInput
              name={props.name}
              onNameChange={props.onNameChange}
              nameError={props.nameError}
              namePlaceholder={props.namePlaceholder}
              nameDisabled={props.nameDisabled}
              inputRef={nameInputRef}
            />
          )}
        </div>
        {props.onRemoveRequested &&
          (removeLabel !== undefined ? (
            <div
              role="button"
              aria-label="Remove"
              tabIndex={0}
              className={cn(
                "flex flex-shrink-0 cursor-pointer flex-row items-center gap-1 rounded-md px-2 py-0.5",
                "select-none text-xs font-semibold text-neutral-dark transition-colors",
                "hover:text-neutral-mid-light focus-visible:outline"
              )}
              onClick={requestRemove}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  requestRemove(e)
                }
              }}>
              <MinusSquareOutlined className="size-3 *:size-3" aria-hidden="true" />
              {removeLabel}
            </div>
          ) : (
            <Tooltip content="Remove" wrappingTriggerDiv={false}>
              <div
                role="button"
                aria-label="Remove"
                className={
                  "flex cursor-pointer flex-col items-center justify-center p-2 text-tertiary transition-colors hover:text-neutral-light"
                }
                onClick={requestRemove}>
                <DeleteOutlined className="size-4 *:size-4" aria-hidden="true" />
              </div>
            </Tooltip>
          ))}
      </div>
      {isOpen && React.Children.toArray(children).length > 0 && (
        <div
          className={cn("grid grid-cols-[1px,1fr] pb-5", noExpansion ? "pl-6 pr-4" : "px-[52px]")}>
          <div className="w-[1px] flex-shrink-0 bg-divider-light"></div>
          <div
            className={cn(
              "grid cursor-auto gap-x-2 gap-y-3",
              propertyColumnsClassName ?? "grid-cols-[12px,max-content,max-content,1fr]"
            )}
            onClick={(e) => e.stopPropagation()}>
            {children}
          </div>
        </div>
      )}
    </div>
  )
})

export function ObjectArrayEditorItemProperty({
  children,
  name,
  singleColumn,
  align = "center",
  hideColon,
}: {
  children?: React.ReactNode
  name?: React.ReactNode
  align?: "top" | "center"
  hideColon?: boolean
} & XOr<{ name: React.ReactNode }, { singleColumn: true }>) {
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
      ) : hideColon ? (
        <div className={cn(alignmentClass, "col-span-3 select-text text-secondary")}>{name}</div>
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

export function ObjectArrayEditorItemAuxiliaryContent({
  children,
  className,
}: {
  className?: string
  children?: React.ReactNode
}) {
  return <div className={cn("col-span-3 col-start-2 flex flex-col", className)}>{children}</div>
}

export function ObjectArrayEditorItemIndentIndicator() {
  return (
    <div className="h-full w-3 shrink-0">
      <div className="h-1/2 border-b border-l border-divider-light" />
    </div>
  )
}

export function ObjectArrayEditorItemNameInput({
  name,
  onNameChange,
  nameError,
  namePlaceholder,
  nameDisabled,
  inputRef,
}: ObjectArrayEditorItemNameInputProps & { inputRef?: React.Ref<HTMLInputElement> }) {
  return (
    <Input
      ref={inputRef}
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

export function ObjectArrayEditorAddButton({
  label,
  onAddRequested,
  className,
  tooltip,
  disabled,
}: ObjectArrayEditorAddButtonProps) {
  return (
    <Tooltip content={tooltip} wrappingTriggerDiv={false}>
      <div className={cn("border-divider-main bg-white [&:not(:first-child)]:border-t", className)}>
        <Add borderless label={label} onAddRequested={onAddRequested} disabled={disabled} />
      </div>
    </Tooltip>
  )
}
