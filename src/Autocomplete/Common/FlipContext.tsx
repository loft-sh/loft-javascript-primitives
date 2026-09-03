import React, { createContext, useMemo, useState } from "react"

type FlipContextValue = {
  flipped: boolean
  setFlipped?: (flipped: boolean) => void
}

export const FlipContext = createContext<FlipContextValue>({ flipped: false })

export function FlipContextProvider({ children }: { children?: React.ReactNode }) {
  const [flipped, setFlipped] = useState(false)

  const ctxValue = useMemo(() => {
    return {
      flipped,
      setFlipped,
    }
  }, [flipped, setFlipped])

  return <FlipContext.Provider value={ctxValue}>{children}</FlipContext.Provider>
}
