import React, { createContext, useMemo } from "react"

import { XOr } from "@loft-enterprise/shared"

type BaseContextValue<T> = {
  id?: string
  value?: T
  setValue?: (value: T) => void
  onSubmit?: (value: T) => void
  error?: string
}

type AutocompleteContextValue = XOr<
  {
    type?: "single"
  } & BaseContextValue<string>,
  {
    type?: "multiple"
  } & BaseContextValue<string[]>
> & {
  onCloseRequested?: () => void
}

// Require type in props, but not in context value. Makes us specify it, but we don't have to check for
// the context value being undefined in consumers!
type AutocompleteContextProviderProps = XOr<
  {
    type: "single"
  } & BaseContextValue<string>,
  {
    type: "multiple"
  } & BaseContextValue<string[]>
> & {
  onCloseRequested?: () => void
  children?: React.ReactNode
}

export const AutocompleteContext = createContext<AutocompleteContextValue>({})

export function AutocompleteContextProvider({
  children,
  type,
  value,
  error,
  id,
  setValue,
  onSubmit,
  onCloseRequested,
}: AutocompleteContextProviderProps) {
  const ctxValue = useMemo(() => {
    return {
      type,
      value,
      error,
      id,
      setValue,
      onSubmit,
      onCloseRequested,
    }
  }, [type, value, error, setValue, onSubmit, onCloseRequested, id])

  return (
    <AutocompleteContext.Provider value={ctxValue as AutocompleteContextValue}>
      {children}
    </AutocompleteContext.Provider>
  )
}
