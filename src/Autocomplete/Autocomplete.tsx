import cn from "clsx"
import React, { useCallback, useContext, useEffect, useRef, useState } from "react"

import { Tooltip } from "../Tooltip"
import { AutocompleteAnchor } from "./Common/AutocompleteAnchor"
import { AutocompleteBox } from "./Common/AutocompleteBox"
import { AutocompleteContext, AutocompleteContextProvider } from "./Common/AutocompleteContext"
import { FlipContext } from "./Common/FlipContext"
import { SuggestionContext, SuggestionContextProvider } from "./Common/SuggestionContext"
import { CloseCircleFilled } from "@loft-enterprise/icons"

type AutocompleteInputProps = {
  placeholder?: string
  icon?: React.ReactNode
  onCloseRequested?: () => void
}

function AutocompleteInput({ placeholder, onCloseRequested, icon }: AutocompleteInputProps) {
  const { flipped } = useContext(FlipContext)
  const inputRef = useRef<HTMLInputElement>(null)
  const inputWrapperRef = useRef<HTMLDivElement>(null)
  const controlWrapperRef = useRef<HTMLDivElement>(null)

  const { onSubmit, value, type, error } = useContext(AutocompleteContext)
  const { inputValue, setInputValue } = useContext(SuggestionContext)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  return (
    <AutocompleteBox
      ref={controlWrapperRef}
      className={cn("z-top-level max-h-48 border-primary-main", {
        "rounded-b-none": !flipped,
        "rounded-t-none": flipped,
      })}
      icon={icon}
      contentClassName={"overflow-y-auto overflow-x-hidden [scrollbar-width:thin]"}
      onClick={(e) => {
        e.stopPropagation()
        e.preventDefault()
        inputRef.current?.focus()
        inputRef.current?.scrollIntoView()
      }}>
      <div ref={inputWrapperRef} className={cn("inline-flex flex-grow")}>
        <input
          ref={inputRef}
          type={"text"}
          spellCheck={false}
          placeholder={placeholder}
          className={
            "min-h-[23px] w-full bg-transparent text-sm placeholder:text-sm placeholder:text-tertiary"
          }
          value={inputValue}
          onChange={(e) => {
            const val = e.target.value
            setInputValue?.(val)
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && type === "single") {
              onCloseRequested?.()
              onSubmit?.(value as string)
            }
          }}
        />
      </div>
      <div
        className={
          "box-border flex w-fit flex-shrink-0 flex-row items-center pl-2 text-danger-main"
        }>
        {error && (
          <Tooltip wrappingTriggerDiv={false} content={error}>
            <CloseCircleFilled className={"size-4 *:size-4"} />
          </Tooltip>
        )}
      </div>
    </AutocompleteBox>
  )
}

type AutocompleteTriggerProps = {
  onClick?: () => void
  value: string
  icon?: React.ReactNode
  placeholder?: string
}

function AutocompleteTrigger({ onClick, value, placeholder, icon }: AutocompleteTriggerProps) {
  const { error } = useContext(AutocompleteContext)

  return (
    <AutocompleteBox
      captureKeyboard={true}
      onKeyboardOpen={onClick}
      icon={icon}
      contentClassName={"overflow-hidden"}
      onClick={onClick}>
      <div className={"flex h-auto flex-grow flex-row items-center overflow-hidden"}>
        <div className={"flex h-auto select-none flex-row items-center gap-1 overflow-hidden"}>
          {!value ? (
            <span className="text-tertiary">{placeholder}</span>
          ) : (
            <span className="truncate">{value}</span>
          )}
        </div>
      </div>
      <div
        className={
          "box-border flex w-fit flex-shrink-0 flex-row items-center pl-2 text-danger-main"
        }>
        {error && (
          <Tooltip wrappingTriggerDiv={false} content={error}>
            <CloseCircleFilled className={"size-4 *:size-4"} />
          </Tooltip>
        )}
      </div>
    </AutocompleteBox>
  )
}

export type AutocompleteProps = {
  placeholder?: string
  children?: React.ReactNode
  value: string
  error?: string
  icon?: React.ReactNode
  setValue?: (values: string) => void
  onClose?: () => void
  onSubmit?: (value: string) => void
}

export function Autocomplete({
  placeholder = "Value...",
  children,
  icon,
  value,
  error,
  onSubmit,
  setValue,
  onClose,
}: AutocompleteProps) {
  const [open, setOpen] = useState<boolean>(false)

  const onCloseRequested = useCallback(() => {
    setOpen(false)
    onClose?.()
  }, [setOpen, onClose])

  return (
    <AutocompleteContextProvider
      type={"single"}
      error={error}
      value={value}
      setValue={setValue}
      onSubmit={onSubmit}
      onCloseRequested={onCloseRequested}>
      {open ? (
        <SuggestionContextProvider>
          <AutocompleteAnchor>
            <AutocompleteInput
              placeholder={placeholder}
              icon={icon}
              onCloseRequested={onCloseRequested}
            />
            {children}
          </AutocompleteAnchor>
        </SuggestionContextProvider>
      ) : (
        <AutocompleteTrigger
          placeholder={placeholder}
          icon={icon}
          onClick={() => setOpen(true)}
          value={value}
        />
      )}
    </AutocompleteContextProvider>
  )
}
