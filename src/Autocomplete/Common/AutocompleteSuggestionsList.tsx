import React, { useContext, useEffect, useMemo, useRef, useState } from "react"

import { cn } from "../../../cn-utils"
import { AutocompleteContext } from "./AutocompleteContext"
import { AutocompleteEmptyState } from "./AutocompleteEmptyState"
import { AutocompleteSuggestion } from "./AutocompleteSuggestion"
import { SuggestionContext } from "./SuggestionContext"
import { PlusOutlined } from "@loft-enterprise/icons"
import { XOr } from "@loft-enterprise/shared"

export type AutocompleteSuggestionsListProps = {
  suggestions?: string[]
  truncateOptions?: boolean
} & XOr<
  {
    hideAddOption?: boolean
  },
  {
    forceAddOption?: boolean
  }
>

export function AutocompleteSuggestionsList({
  suggestions,
  forceAddOption,
  hideAddOption,
  truncateOptions,
}: AutocompleteSuggestionsListProps) {
  const ctx = useContext(AutocompleteContext)
  const { inputValue } = useContext(SuggestionContext)

  const [skipFilter, setSkipFilter] = useState(ctx.type === "single")
  const initialValueRef = useRef(inputValue)

  useEffect(() => {
    if (initialValueRef.current !== inputValue) {
      setSkipFilter(false)
    }
  }, [inputValue])

  const availableSuggestions = useMemo(() => {
    return suggestions?.filter((s) => {
      if (skipFilter) {
        return true
      }

      // Check if the value the user types in matches.
      if (!s.toLowerCase().includes(inputValue.toLowerCase().trim())) {
        return false
      }

      // Filter by already set values.
      if (ctx.type === "multiple") {
        return !ctx.value?.find((el) => el === s)
      }

      return true
    })
  }, [ctx.value, inputValue, suggestions, ctx.type, skipFilter])

  const displayAddOption = useMemo(() => {
    if (hideAddOption) {
      return false
    }

    if (forceAddOption) {
      return !!inputValue
    }

    if (ctx.type !== "multiple") {
      return false
    }

    // Don't display if there is an EXACT match.
    if (suggestions?.find((sugg) => inputValue === sugg)) {
      return false
    }

    // Don't display if value exists.
    if (ctx.value?.find((val) => val === inputValue)) {
      return false
    }

    return !!inputValue
  }, [inputValue, ctx.value, suggestions, ctx.type, hideAddOption, forceAddOption])

  return (
    <div
      role="listbox"
      id={`${ctx.id}-suggestions`}
      aria-label={"Suggestions"}
      className={"flex w-full flex-col p-1"}>
      {displayAddOption && (
        <AutocompleteSuggestion value={inputValue} listIndex={0}>
          <PlusOutlined className={"size-4 *:size-4"} aria-hidden={true} />
          <div className={"truncate"}>
            <span className={"font-medium"}>
              {ctx.type === "multiple" ? "Add" : "Set"} value
              {ctx.type === "multiple" ? " item" : ""}:{" "}
            </span>
            <span className={"w-full"}>{inputValue}</span>
          </div>
        </AutocompleteSuggestion>
      )}
      {availableSuggestions?.map((sugg, index) => (
        <AutocompleteSuggestion
          listIndex={index + 1}
          key={sugg}
          value={sugg}
          className={cn({ "!block truncate": truncateOptions })}>
          {sugg}
        </AutocompleteSuggestion>
      ))}
      {!displayAddOption && !availableSuggestions?.length && <AutocompleteEmptyState />}
    </div>
  )
}
