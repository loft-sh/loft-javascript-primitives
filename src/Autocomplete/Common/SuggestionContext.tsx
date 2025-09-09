import React, {
  createContext,
  ForwardedRef,
  forwardRef,
  useContext,
  useImperativeHandle,
  useMemo,
  useState,
} from "react"

import { AutocompleteContext } from "./AutocompleteContext"

export type SuggestionContextValue = {
  inputValue: string
  setInputValue?: (inputValue: string) => void
}

export const SuggestionContext = createContext<SuggestionContextValue>({
  inputValue: "",
})

export const SuggestionContextProvider = forwardRef(function InnerSuggestionContextProvider(
  { children }: { children?: React.ReactNode },
  ref: ForwardedRef<SuggestionContextValue>
) {
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

  // Also expose the value to the components above so we can use the inputValue in onCloseRequested.
  useImperativeHandle(ref, () => ctxValue, [ctxValue])

  return <SuggestionContext.Provider value={ctxValue}>{children}</SuggestionContext.Provider>
})
