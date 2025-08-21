import cn from "clsx"
import React, {
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { createPortal } from "react-dom"

import { AutocompleteAnchor } from "./Common/AutocompleteAnchor"
import { AutocompleteBox } from "./Common/AutocompleteBox"
import { AutocompleteContextProvider } from "./Common/AutocompleteContext"
import { FlipContext } from "./Common/FlipContext"
import { SuggestionContext, SuggestionContextProvider } from "./Common/SuggestionContext"
import { CloseOutlined } from "@loft-enterprise/icons"

type MultiAutocompleteItemProps = {
  value: string
  onRemoveRequested?: () => void
  className?: string
}

const MultiAutocompleteItem = forwardRef<HTMLDivElement, MultiAutocompleteItemProps>(
  function InnerMultiAutocompleteItem({ value, onRemoveRequested, className }, ref) {
    return (
      <div
        ref={ref}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "box-border flex w-fit flex-row items-center gap-1 truncate border border-neutral-main px-1.5 py-0.5",
          "group/autocomplete-value rounded-md text-sm text-primary [&_*]:!text-primary [&_svg]:!size-3",
          "box-border cursor-default overflow-hidden",
          className
        )}>
        <span className={"select-none truncate whitespace-nowrap [line-height:17px]"}>{value}</span>
        <CloseOutlined
          className="ml-1 h-3 w-3 flex-shrink-0 cursor-pointer text-secondary"
          onClick={onRemoveRequested}
        />
      </div>
    )
  }
)

type MultiAutocompleteInputProps = {
  values: string[]
  icon?: React.ReactNode
  onValuesChanged?: (values: string[]) => void
  placeholder?: string
}

function MultiAutocompleteInput({
  values,
  onValuesChanged,
  placeholder,
  icon,
}: MultiAutocompleteInputProps) {
  const { flipped } = useContext(FlipContext)
  const inputRef = useRef<HTMLInputElement>(null)
  const inputWrapperRef = useRef<HTMLDivElement>(null)
  const controlWrapperRef = useRef<HTMLDivElement>(null)
  const textMeasureRef = useRef<HTMLDivElement>(null)

  const { inputValue, setInputValue } = useContext(SuggestionContext)

  useLayoutEffect(() => {
    if (textMeasureRef.current && inputWrapperRef.current && controlWrapperRef.current) {
      const width = textMeasureRef.current.getBoundingClientRect().width

      const computedStyle = window.getComputedStyle(controlWrapperRef.current!)
      const pl = parseFloat(computedStyle.paddingLeft)
      const pr = parseFloat(computedStyle.paddingRight)
      let containerPadding = 0

      if (pl === pl && pr === pr) {
        containerPadding = pl + pr
      }

      const maxWidth = controlWrapperRef.current.getBoundingClientRect().width - containerPadding

      inputWrapperRef.current.style.flexBasis = `${Math.max(Math.min(width, maxWidth), 64)}px`
      inputRef.current?.scrollIntoView()
    }
  }, [inputValue])

  useEffect(() => {
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
      contentClassName={"flex-wrap overflow-y-auto overflow-x-hidden [scrollbar-width:thin]"}
      onClick={(e) => {
        e.stopPropagation()
        e.preventDefault()
        inputRef.current?.focus()
        inputRef.current?.scrollIntoView()
      }}>
      <div
        className={
          "pointer-events-none fixed left-0 top-0 h-0 w-0 overflow-scroll opacity-0 [scrollbar-width:none] [visibility:hidden]"
        }>
        <div className={"w-fit whitespace-nowrap text-sm"} ref={textMeasureRef}>
          {inputValue}
        </div>
      </div>
      {values.map((v, i) => (
        <MultiAutocompleteItem
          value={v}
          key={v}
          onRemoveRequested={() => {
            const copiedValues = [...values]
            copiedValues.splice(i, 1)
            onValuesChanged?.(copiedValues)
          }}
        />
      ))}

      <div
        ref={inputWrapperRef}
        className={cn("inline-flex w-auto flex-shrink flex-grow basis-16")}>
        <input
          ref={inputRef}
          type={"text"}
          spellCheck={false}
          placeholder={placeholder}
          className={
            "min-h-[23px] w-full bg-transparent text-sm placeholder:text-sm placeholder:text-tertiary"
          }
          value={inputValue}
          onBlur={() => {
            const trimmed = inputValue.trim()
            if (trimmed && !values.includes(trimmed)) {
              onValuesChanged?.([...values, trimmed])
            }
            setInputValue?.("")
          }}
          onChange={(e) => {
            setInputValue?.(e.target.value)
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const trimmed = inputValue.trim()
              if (trimmed && !values.includes(trimmed)) {
                onValuesChanged?.([...values, trimmed])
              }
              setInputValue?.("")

              requestAnimationFrame(() => {
                inputRef.current?.scrollIntoView()
              })
            } else if (e.key === "Backspace" && !inputValue) {
              const copiedValues = values.slice(0, values.length - 1)
              onValuesChanged?.(copiedValues)
            }
          }}
        />
      </div>
    </AutocompleteBox>
  )
}

type MultiAutocompleteTriggerProps = {
  onClick?: () => void
  values: string[]
  icon?: React.ReactNode
  placeholder?: string
}

function MultiAutocompleteTrigger({
  onClick,
  values,
  placeholder,
  icon,
}: MultiAutocompleteTriggerProps) {
  const measurerRef = useRef<HTMLDivElement>(null)
  const valueContainerRef = useRef<HTMLDivElement>(null)

  const refs = useMemo(() => values.map(() => React.createRef<HTMLDivElement>()), [values])

  const [itemSizes, setItemSizes] = useState<Record<number, number>>({})
  const [containerSize, setContainerSize] = useState<number>(0)

  useLayoutEffect(() => {
    const updateItemSizes = () => {
      const widths: Record<number, number> = {}
      refs.forEach((ref, i) => {
        if (ref.current) {
          const { width } = ref.current.getBoundingClientRect()
          widths[i] = width
        }
      })
      setItemSizes(widths)
    }

    const updateContainerSize = () => {
      if (!valueContainerRef.current) {
        return
      }

      const rect = valueContainerRef.current.getBoundingClientRect()
      setContainerSize(rect.width)
    }

    const itemsResizeObserver = new ResizeObserver(updateItemSizes)
    if (measurerRef.current) {
      itemsResizeObserver.observe(measurerRef.current)
    }

    const containerResizeObserver = new ResizeObserver(updateContainerSize)
    if (valueContainerRef.current) {
      containerResizeObserver.observe(valueContainerRef.current)
    }
    updateItemSizes()
    updateContainerSize()

    return () => {
      itemsResizeObserver.disconnect()
      containerResizeObserver.disconnect()
    }
  }, [refs])

  const [visibility, setVisibility] = useState<{
    visibleItems: string[]
    overflowItemCount: number
  }>({ visibleItems: [], overflowItemCount: 0 })

  useLayoutEffect(() => {
    if (!values.length) {
      setVisibility({ visibleItems: [], overflowItemCount: 0 })

      return
    }

    // ALWAYS show the first item. It gets nicely truncated if neccessary.
    const visibleItems = [values[0]!]

    if (values.length === 1) {
      setVisibility({ visibleItems, overflowItemCount: 0 })

      return
    }

    let accumulatedLength = itemSizes[0] ?? 0

    for (let i = 1; i < values.length; i++) {
      const length = itemSizes[i] ?? 0
      accumulatedLength += length + 4 // This is derived from the chip gap size!

      // This is the reserved space for the + x more... text.
      // We take its max size (96px) and then add an extra pixel so we can prevent flicker
      // in some cases when resizing the window fast.
      const tailSize = 96 + 1

      if (accumulatedLength > containerSize - tailSize) {
        break
      }

      visibleItems.push(values[i]!)
    }
    setVisibility({ visibleItems, overflowItemCount: values.length - visibleItems.length })
  }, [itemSizes, containerSize, values])

  return (
    <AutocompleteBox
      contentClassName={"overflow-hidden"}
      onClick={onClick}
      icon={icon}
      captureKeyboard={true}
      onKeyboardOpen={onClick}>
      {createPortal(
        <div
          ref={measurerRef}
          className={
            "pointer-events-none fixed left-0 top-0 h-0 w-0 overflow-scroll opacity-0 [visibility:hidden]"
          }>
          <div className={"flex w-fit flex-shrink-0 flex-row items-center gap-1"}>
            {values.map((v, i) => (
              <MultiAutocompleteItem ref={refs[i]} key={v} value={v}></MultiAutocompleteItem>
            ))}
          </div>
        </div>,
        document.body
      )}
      <div
        ref={valueContainerRef}
        className={"flex h-auto flex-grow flex-row items-center overflow-hidden"}>
        <div className={"flex h-auto flex-row items-center gap-1 overflow-hidden"}>
          {visibility.visibleItems.length === 0 && (
            <span className="text-tertiary">{placeholder}</span>
          )}
          {visibility.visibleItems.map((v) => (
            <MultiAutocompleteItem value={v} key={v} className={"pointer-events-none"} />
          ))}
        </div>

        <div
          className={
            "box-border w-fit max-w-24 flex-shrink-0 truncate pl-1.5 text-sm text-tertiary"
          }>
          {visibility.overflowItemCount ? `+ ${visibility.overflowItemCount} more` : <></>}
        </div>
      </div>
    </AutocompleteBox>
  )
}

export type MultiAutocompleteProps = {
  placeholder?: string
  children?: React.ReactNode
  value: string[]
  icon?: React.ReactNode
  setValue?: (values: string[]) => void
}

export function MultiAutocomplete({
  placeholder = "Value...",
  children,
  value,
  setValue,
  icon,
}: MultiAutocompleteProps) {
  const [open, setOpen] = useState<boolean>(false)

  const onCloseRequested = useCallback(() => {
    setOpen(false)
  }, [setOpen])

  return (
    <AutocompleteContextProvider
      type={"multiple"}
      value={value}
      setValue={setValue}
      onCloseRequested={onCloseRequested}>
      {open ? (
        <SuggestionContextProvider>
          <AutocompleteAnchor>
            <MultiAutocompleteInput
              icon={icon}
              placeholder={placeholder}
              values={value}
              onValuesChanged={setValue}
            />
            {children}
          </AutocompleteAnchor>
        </SuggestionContextProvider>
      ) : (
        <MultiAutocompleteTrigger
          icon={icon}
          placeholder={placeholder}
          onClick={() => setOpen(true)}
          values={value}
        />
      )}
    </AutocompleteContextProvider>
  )
}
