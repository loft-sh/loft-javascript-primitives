import React, {
  createContext,
  ForwardedRef,
  forwardRef,
  useCallback,
  useContext,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react"

import { AutocompleteContext } from "./AutocompleteContext"
import { wrapNumber } from "@loft-enterprise/shared"

export type SuggestionContextValue = {
  inputValue: string
  setInputValue?: (inputValue: string) => void
  setSuggestionRef?: (id: number, ref: HTMLDivElement) => void
  removeSuggestionRef?: (id: number) => void
  focusSuggestionRef?: (id: number) => void
  focusFirstSuggestion?: () => void
  focusLastSuggestion?: () => void
  focusNextFromCurrent?: (currentId: number) => void
  focusPrevFromCurrent?: (currentId: number) => void
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

  const suggestionRefs = useRef<Record<number, HTMLDivElement>>({})

  const setSuggestionRef = useCallback((id: number, ref: HTMLDivElement) => {
    suggestionRefs.current[id] = ref
  }, [])

  const removeSuggestionRef = useCallback((id: number) => {
    delete suggestionRefs.current[id]
  }, [])

  const focusSuggestionRef = useCallback((id: number) => {
    const ref = suggestionRefs.current[id]
    if (ref) {
      ref.focus()
    }
  }, [])

  const focusFirstSuggestion = useCallback(() => {
    const minIndex = getEdgeIndex(suggestionRefs.current, Math.min)

    if (minIndex != null) {
      focusSuggestionRef(minIndex)
    }
  }, [focusSuggestionRef])

  const focusLastSuggestion = useCallback(() => {
    const maxIndex = getEdgeIndex(suggestionRefs.current, Math.max)

    if (maxIndex != null) {
      focusSuggestionRef(maxIndex)
    }
  }, [focusSuggestionRef])

  const focusNextFromCurrent = useCallback(
    (currentId: number) => {
      const nextIndex = moveSteps(suggestionRefs.current, currentId, 1)

      if (nextIndex != null) {
        focusSuggestionRef(nextIndex)
      }
    },
    [focusSuggestionRef]
  )

  const focusPrevFromCurrent = useCallback(
    (currentId: number) => {
      const prevIndex = moveSteps(suggestionRefs.current, currentId, -1)

      if (prevIndex != null) {
        focusSuggestionRef(prevIndex)
      }
    },
    [focusSuggestionRef]
  )

  const ctxValue = useMemo(() => {
    const baseCtx = {
      setSuggestionRef,
      removeSuggestionRef,
      focusSuggestionRef,
      focusFirstSuggestion,
      focusLastSuggestion,
      focusNextFromCurrent,
      focusPrevFromCurrent,
    } as const

    // For single-selection autocomplete, we just forward the value.
    if (mainCtx.type === "single") {
      return {
        ...baseCtx,
        inputValue: mainCtx.value || "",
        setInputValue: mainCtx.setValue,
      }
    }

    return {
      ...baseCtx,
      inputValue,
      setInputValue,
    }
  }, [
    inputValue,
    setInputValue,
    mainCtx.type,
    mainCtx.value,
    mainCtx.setValue,
    setSuggestionRef,
    removeSuggestionRef,
    focusSuggestionRef,
    focusFirstSuggestion,
    focusLastSuggestion,
    focusNextFromCurrent,
    focusPrevFromCurrent,
  ])

  // Also expose the value to the components above so we can use the inputValue in onCloseRequested.
  useImperativeHandle(ref, () => ctxValue, [ctxValue])

  return <SuggestionContext.Provider value={ctxValue}>{children}</SuggestionContext.Provider>
})

function getEdgeIndex(
  refMap: Record<number, HTMLDivElement>,
  fn: typeof Math.max | typeof Math.min
) {
  const keys = Object.keys(refMap)

  let edgeIndex: number | null = null
  for (const key of keys) {
    const index = parseInt(key, 10)
    if (Number.isNaN(index)) {
      continue
    }

    edgeIndex = fn(edgeIndex ?? index, index)
  }

  return edgeIndex
}

function moveSteps(refMap: Record<number, HTMLDivElement>, currentId: number, delta: number) {
  const indices = Object.keys(refMap)
    .map((k) => parseInt(k, 10))
    .filter((k) => !Number.isNaN(k))

  if (indices.length < 2) {
    return
  }

  const position = indices.findIndex((i) => i === currentId)
  const nextPosition = wrapNumber(position + delta, indices.length)

  return indices[nextPosition]
}
