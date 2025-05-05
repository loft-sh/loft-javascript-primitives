import * as React from "react"
import { useCallback, useImperativeHandle, useRef } from "react"

import { Input } from "../../Input"
import { CommonSelectEmptyState } from "./CommonSelectEmptyState"
import { SearchOutlined } from "@loft-enterprise/icons"

type CommonSelectSearchInputProps = Omit<
  React.ComponentPropsWithoutRef<typeof Input>,
  | "preffix"
  | "onMouseDown"
  | "onKeyDown"
  | "className"
  | "inputClassName"
  | "placeholder"
  | "type"
  | "spellCheck"
  | "prefixClassName"
>

export const CommonSelectSearchInput = React.forwardRef<
  React.ElementRef<typeof Input>,
  CommonSelectSearchInputProps
>(({ ...props }, ref) => {
  const innerRef = useRef<HTMLInputElement>(null)

  const focusInput = useCallback(() => {
    innerRef.current?.focus()
  }, [])

  const stopPropagation = useCallback((e: { stopPropagation: () => void }) => {
    e.stopPropagation()
  }, [])

  useImperativeHandle(ref, () => innerRef.current!)

  return (
    <div
      className={"box-border flex w-full flex-row items-center border-b border-divider-main p-2"}>
      <Input
        ref={innerRef}
        className={"w-full"}
        preffix={<SearchOutlined className={"!cursor-text"} onClick={focusInput} />}
        prefixClassName={"pointer-events-auto"}
        onMouseDown={stopPropagation}
        onKeyDown={stopPropagation}
        inputClassName={"pl-0.5"}
        placeholder={"Search..."}
        type={"text"}
        spellCheck={false}
        {...props}
      />
    </div>
  )
})
CommonSelectSearchInput.displayName = "CommonSelectSearchInput"

export function CommonSelectSearchList({
  children,
  hasFilteredOptions,
  ...props
}: CommonSelectSearchInputProps & { children: React.ReactNode; hasFilteredOptions: boolean }) {
  return (
    <>
      <CommonSelectSearchInput {...props} />
      <div className={"flex max-h-64 w-full flex-col overflow-y-auto p-1"}>
        {children}
        {!hasFilteredOptions && <CommonSelectEmptyState />}
      </div>
    </>
  )
}
