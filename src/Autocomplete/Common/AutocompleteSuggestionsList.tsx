import React, { useContext, useMemo } from "react"

import { AutocompleteContext } from "./AutocompleteContext"
import { AutocompleteEmptyState } from "./AutocompleteEmptyState"
import { AutocompleteSuggestion } from "./AutocompleteSuggestion"
import { SuggestionContext } from "./SuggestionContext"
import { PlusOutlined } from "@loft-enterprise/icons"

export type AutocompleteSuggestionsListProps = {
  suggestions?: string[]
  hideAddOption?: boolean
}

export function AutocompleteSuggestionsList({
  suggestions,
  hideAddOption,
}: AutocompleteSuggestionsListProps) {
  const ctx = useContext(AutocompleteContext)
  const { inputValue } = useContext(SuggestionContext)

  const availableSuggestions = useMemo(() => {
    return suggestions?.filter((s) => {
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
  }, [ctx.value, inputValue, suggestions, ctx.type])

  const displayAddOption = useMemo(() => {
    if (hideAddOption) {
      return false
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
  }, [inputValue, ctx.value, suggestions, ctx.type, hideAddOption])

  return (
    <div className={"flex w-full flex-col p-1"}>
      {displayAddOption && (
        <AutocompleteSuggestion value={inputValue}>
          <PlusOutlined className={"size-4 *:size-4"} />
          <div>
            <span className={"font-medium"}>Add value item: </span>
            <span>{inputValue}</span>
          </div>
        </AutocompleteSuggestion>
      )}
      {availableSuggestions?.map((sugg) => (
        <AutocompleteSuggestion key={sugg} value={sugg}>
          {sugg}
        </AutocompleteSuggestion>
      ))}
      {!displayAddOption && !availableSuggestions?.length && <AutocompleteEmptyState />}
    </div>
  )
}
