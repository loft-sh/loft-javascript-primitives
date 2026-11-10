import React, { useCallback, useContext } from "react"

import { cn } from "../../../cn-utils"
import { AutocompleteContext } from "./AutocompleteContext"
import { SuggestionContext } from "./SuggestionContext"
import { arr } from "@loft-enterprise/shared"

export type AutocompleteSuggestionProps = {
  value: string
  children?: React.ReactNode
  className?: string
  listIndex?: number
}

export function AutocompleteSuggestion({
  value: suggestionValue,
  children,
  className,
  listIndex,
}: AutocompleteSuggestionProps) {
  const {
    setInputValue,
    setSuggestionRef,
    removeSuggestionRef,
    focusNextFromCurrent,
    focusPrevFromCurrent,
  } = useContext(SuggestionContext)

  const {
    value: currentValue,
    setValue,
    onCloseRequested,
    onSubmit,
    type,
  } = useContext(AutocompleteContext)

  const onSelect = () => {
    setInputValue?.("")

    if (type === "multiple") {
      setValue?.([...arr(currentValue), suggestionValue])
    } else if (type === "single") {
      setValue?.(suggestionValue)
      onCloseRequested?.()
      onSubmit?.(suggestionValue)
    }
  }

  const refFn = useCallback(
    (ref: HTMLDivElement | null) => {
      if (listIndex == null) {
        return
      }

      if (ref && setSuggestionRef) {
        setSuggestionRef(listIndex, ref)
      } else if (!ref && removeSuggestionRef) {
        removeSuggestionRef(listIndex)
      }
    },
    [setSuggestionRef, removeSuggestionRef, listIndex]
  )

  return (
    <div
      className={cn(
        "relative box-border flex w-full cursor-pointer select-none flex-row transition-colors",
        "items-center gap-2 rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none",
        "hover:bg-neutral-extra-light focus:bg-neutral-light",
        className
      )}
      ref={refFn}
      tabIndex={0}
      onMouseDown={(e) => {
        e.stopPropagation()
        e.preventDefault()
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.stopPropagation()
          e.preventDefault()

          onSelect()

          return
        } else if (e.key === "ArrowDown" && listIndex != null) {
          e.preventDefault()
          e.stopPropagation()
          focusNextFromCurrent?.(listIndex)
        } else if (e.key === "ArrowUp" && listIndex != null) {
          e.preventDefault()
          e.stopPropagation()
          focusPrevFromCurrent?.(listIndex)
        }
      }}
      onClick={(e) => {
        e.stopPropagation()
        onSelect()
      }}>
      {children}
    </div>
  )
}
