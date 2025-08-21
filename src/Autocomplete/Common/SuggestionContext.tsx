import React, { createContext, useContext, useMemo, useState } from "react"

import { AutocompleteContext } from "./AutocompleteContext"

type SuggestionContextValue = {
  inputValue: string
  setInputValue?: (inputValue: string) => void
}

export const SuggestionContext = createContext<SuggestionContextValue>({
  inputValue: "",
})

export function SuggestionContextProvider({ children }: { children?: React.ReactNode }) {
  const [inputValue, setInputValue] = useState("")

  const mainCtx = useContext(AutocompleteContext)

  const ctxValue = useMemo(() => {
    // For single-selection autocomplete, we just forward the value.
    if (mainCtx.type === "single") {
      return {
        inputValue: mainCtx.value || "",
        setInputValue: mainCtx.setValue,
      }
    }

    return {
      inputValue,
      setInputValue,
    }
  }, [inputValue, setInputValue, mainCtx.type, mainCtx.value, mainCtx.setValue])

  return <SuggestionContext.Provider value={ctxValue}>{children}</SuggestionContext.Provider>
}
