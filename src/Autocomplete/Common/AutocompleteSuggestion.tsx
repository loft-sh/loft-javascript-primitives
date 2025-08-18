import cn from "clsx"
import React, { useContext } from "react"

import { AutocompleteContext } from "./AutocompleteContext"
import { SuggestionContext } from "./SuggestionContext"
import { arr } from "@loft-enterprise/shared"

export type AutocompleteSuggestionProps = {
  value: string
  children?: React.ReactNode
}

export function AutocompleteSuggestion({ value, children }: AutocompleteSuggestionProps) {
  const { setInputValue } = useContext(SuggestionContext)
  const ctx = useContext(AutocompleteContext)

  return (
    <div
      className={cn(
        "relative box-border flex w-full cursor-pointer select-none flex-row transition-colors",
        "items-center gap-2 rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none",
        "hover:bg-neutral-extra-light"
      )}
      onClick={(e) => {
        e.stopPropagation()
        setInputValue?.("")

        if (ctx.type === "multiple") {
          ctx.setValue?.([...arr(ctx.value), value])
        } else if (ctx.type === "single") {
          ctx.setValue?.(value)
          ctx.onCloseRequested?.()
          ctx.onSubmit?.(value)
        }
      }}>
      {children}
    </div>
  )
}
