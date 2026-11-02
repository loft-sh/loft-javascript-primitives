import React, { createContext, Dispatch, SetStateAction, useContext, useMemo } from "react"

type ObjectArrayEditorContextValue = {
  openItem: string | null
  setOpenItem: Dispatch<SetStateAction<string | null>>
}

const ObjectArrayEditorContext = createContext<ObjectArrayEditorContextValue | null>(null)

type ObjectArrayEditorContextProviderProps = {
  children: React.ReactNode
  openItem: string | null
  setOpenItem: Dispatch<SetStateAction<string | null>>
}

export function ObjectArrayEditorContextProvider({
  children,
  openItem,
  setOpenItem,
}: ObjectArrayEditorContextProviderProps) {
  const value = useMemo(() => ({ openItem, setOpenItem }), [openItem, setOpenItem])

  return (
    <ObjectArrayEditorContext.Provider value={value}>{children}</ObjectArrayEditorContext.Provider>
  )
}

export function useObjectArrayEditorContext(): ObjectArrayEditorContextValue {
  const context = useContext(ObjectArrayEditorContext)

  if (!context) {
    throw new Error(
      "useObjectArrayEditorContext must be used within a ObjectArrayEditorContextProvider"
    )
  }

  return context
}

export function useObjectArrayEditorContextOptional(): Partial<ObjectArrayEditorContextValue> {
  const context = useContext(ObjectArrayEditorContext)

  return context ?? {}
}
