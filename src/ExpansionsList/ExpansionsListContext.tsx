import React, { createContext, Dispatch, SetStateAction, useContext, useMemo } from "react"

type ExpansionsListContextValue = {
  openItem: string | null
  setOpenItem: Dispatch<SetStateAction<string | null>>
}

const ExpansionsListContext = createContext<ExpansionsListContextValue | null>(null)

type ExpansionsListContextProviderProps = {
  children: React.ReactNode
  openItem: string | null
  setOpenItem: Dispatch<SetStateAction<string | null>>
}

export function ExpansionsListContextProvider({
  children,
  openItem,
  setOpenItem,
}: ExpansionsListContextProviderProps) {
  const value = useMemo(() => ({ openItem, setOpenItem }), [openItem, setOpenItem])

  return <ExpansionsListContext.Provider value={value}>{children}</ExpansionsListContext.Provider>
}

export function useExpansionsListContext(): ExpansionsListContextValue {
  const context = useContext(ExpansionsListContext)

  if (!context) {
    throw new Error("useExpansionsListContext must be used within a ExpansionsListContextProvider")
  }

  return context
}

export function useExpansionsListContextOptional(): Partial<ExpansionsListContextValue> {
  const context = useContext(ExpansionsListContext)

  return context ?? {}
}
