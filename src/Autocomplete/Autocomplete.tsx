import React, {
  ChangeEvent,
  ForwardedRef,
  forwardRef,
  KeyboardEvent,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react"

import { cn } from "../../cn-utils"
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

const AutocompleteTextInput = forwardRef(function InnerAutocompleteTextInput(
  { placeholder }: { placeholder?: string },
  ref: ForwardedRef<HTMLInputElement>
) {
  const { inputValue, setInputValue, focusLastSuggestion, focusFirstSuggestion } =
    useContext(SuggestionContext)
  const { onSubmit, value, type, onCloseRequested } = useContext(AutocompleteContext)

  const onChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value
      setInputValue?.(val)
    },
    [setInputValue]
  )

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && type === "single") {
        onCloseRequested?.()
        onSubmit?.(value as string)
      } else if (e.key === "ArrowDown") {
        e.preventDefault()
        e.stopPropagation()
        focusFirstSuggestion?.()
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        e.stopPropagation()
        focusLastSuggestion?.()
      }
    },
    [onCloseRequested, onSubmit, value, type, focusLastSuggestion, focusFirstSuggestion]
  )

  return (
    <input
      ref={ref}
      type={"text"}
      spellCheck={false}
      placeholder={placeholder}
      className={
        "min-h-[23px] w-full bg-transparent text-sm placeholder:text-sm placeholder:text-tertiary"
      }
      value={inputValue}
      onChange={onChange}
      onKeyDown={onKeyDown}
    />
  )
})

function AutocompleteInput({ placeholder, icon }: AutocompleteInputProps) {
  const { flipped } = useContext(FlipContext)
  const inputRef = useRef<HTMLInputElement>(null)
  const inputWrapperRef = useRef<HTMLDivElement>(null)
  const controlWrapperRef = useRef<HTMLDivElement>(null)

  const { error } = useContext(AutocompleteContext)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const onClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    inputRef.current?.focus()
    inputRef.current?.scrollIntoView()
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
      onClick={onClick}>
      <div ref={inputWrapperRef} className={cn("inline-flex flex-grow")}>
        <AutocompleteTextInput ref={inputRef} placeholder={placeholder} />
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
  onOpenRequested?: () => void
  value: string
  icon?: React.ReactNode
  disabled?: boolean
  placeholder?: string
}

function AutocompleteTrigger({
  onOpenRequested,
  value,
  placeholder,
  disabled,
  icon,
}: AutocompleteTriggerProps) {
  const { error } = useContext(AutocompleteContext)

  return (
    <AutocompleteBox
      captureKeyboard={true}
      onKeyboardOpen={onOpenRequested}
      disabled={disabled}
      icon={icon}
      contentClassName={"overflow-hidden"}
      onClick={onOpenRequested}>
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
  disabled?: boolean
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
  disabled,
  onSubmit,
  setValue,
  onClose,
}: AutocompleteProps) {
  const [open, setOpen] = useState<boolean>(false)

  const onCloseRequested = useCallback(() => {
    setOpen(false)
    onClose?.()
  }, [setOpen, onClose])

  const onOpenRequested = useCallback(() => {
    setOpen(true)
  }, [])

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
          disabled={disabled}
          onOpenRequested={onOpenRequested}
          value={value}
        />
      )}
    </AutocompleteContextProvider>
  )
}
