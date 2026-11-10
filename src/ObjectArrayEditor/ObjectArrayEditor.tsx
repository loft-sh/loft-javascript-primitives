import React, { forwardRef, useEffect, useId, useImperativeHandle, useRef, useState } from "react"

import { cn } from "../../cn-utils"
import { Add } from "../Add"
import { Input } from "../Input"
import { Tooltip } from "../Tooltip"
import {
  ObjectArrayEditorContextProvider,
  useObjectArrayEditorContext,
} from "./ObjectArrayEditorContext"
import { CollapseIcon, DeleteOutlined, ExpandIcon } from "@loft-enterprise/icons"
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
  { className, children, propertyColumnsClassName, ...props },
  ref
) {
  const id = useId()

  const { openItem, setOpenItem } = useObjectArrayEditorContext()

  const nameInputRef = useRef<HTMLInputElement>(null)

  const isOpen = openItem === id

  useImperativeHandle(
    ref,
    () => ({
      open: (focusName = true) => {
        setOpenItem(id)
        if (focusName) {
          nameInputRef.current?.focus()
        }
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
