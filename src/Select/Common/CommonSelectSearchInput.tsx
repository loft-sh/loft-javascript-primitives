import * as React from "react"
import { useCallback, useEffect, useImperativeHandle, useRef } from "react"

import { Input } from "../../Input"
import { MultiSelectSeparator } from "../MultiSelect"
import { CommonSelectEmptyState } from "./CommonSelectEmptyState"
import { SearchOutlined } from "@loft-enterprise/icons"

type CommonSelectSearchInputProps = Omit<
  React.ComponentPropsWithoutRef<typeof Input>,
  | "preffix"
  | "onMouseDown"
  | "onKeyDown"
  | "className"
  | "inputClassName"
  | "type"
  | "spellCheck"
  | "prefixClassName"
> & {
  hideIcon?: boolean
  onEnterPressed?: () => void
}

export const CommonSelectSearchInput = React.forwardRef<
  React.ElementRef<typeof Input>,
  CommonSelectSearchInputProps
>(
  (
    {
      "aria-label": ariaLabel = "Search",
      placeholder,
      hideIcon,
      onEnterPressed,
      autoFocus,
      ...props
    },
    ref
  ) => {
    const innerRef = useRef<HTMLInputElement>(null)

    const focusInput = useCallback(() => {
      innerRef.current?.focus()
    }, [])

    const stopPropagation = useCallback((e: { stopPropagation: () => void }) => {
      e.stopPropagation()
    }, [])

    const onKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        e.stopPropagation()
        if (e.key === "Enter") {
          onEnterPressed?.()
        }
      },
      [onEnterPressed]
    )

    useEffect(() => {
      if (autoFocus) {
        requestAnimationFrame(() => {
          innerRef.current?.focus()
        })
      }
    }, [autoFocus])

    useImperativeHandle(ref, () => innerRef.current!)

    return (
      <div
        className={"box-border flex w-full flex-row items-center border-b border-divider-main p-2"}>
        <Input
          ref={innerRef}
          className={"w-full"}
          preffix={
            hideIcon ? undefined : (
              <SearchOutlined className={"!cursor-text"} onClick={focusInput} aria-hidden="true" />
            )
          }
          prefixClassName={"pointer-events-auto"}
          onMouseDown={stopPropagation}
          onKeyDown={onKeyDown}
          inputClassName={hideIcon ? undefined : "pl-0.5"}
          placeholder={placeholder || "Search..."}
          type={"text"}
          spellCheck={false}
          role="searchbox"
          aria-label={ariaLabel}
          {...props}
        />
      </div>
    )
  }
)
CommonSelectSearchInput.displayName = "CommonSelectSearchInput"

export function CommonSelectSearchList({
  children,
  hasFilteredOptions,
  listPrefix,
  hideEmptyState,
  emptyStateVariant,
  ...props
}: CommonSelectSearchInputProps & {
  children: React.ReactNode
  listPrefix?: React.ReactNode
  hasFilteredOptions: boolean
  hideEmptyState?: boolean
  emptyStateVariant?: "small" | "large"
}) {
  return (
    <>
      <CommonSelectSearchInput {...props} />
      {listPrefix && (
        <>
          <div className="p-1">{listPrefix}</div>
          <MultiSelectSeparator />
        </>
      )}
      <div
        className={"flex max-h-64 w-full flex-col overflow-y-auto p-1"}
        role="listbox"
        aria-label={props["aria-label"] ? `${props["aria-label"]} results` : "Search results"}>
        {children}
        {!hasFilteredOptions && !hideEmptyState && (
          <CommonSelectEmptyState variant={emptyStateVariant} />
        )}
      </div>
    </>
  )
}
