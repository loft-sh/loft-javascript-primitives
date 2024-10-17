import React, { useEffect, useRef, useState } from "react"

const HighlightSection = ({
  children,
  from = "bg-primary-extra-light",
  to = "transparent",
  isFlashing,
  setHighlight,
}: {
  children: React.ReactNode
  from?: string
  to?: string
  highlightId: string
  isFlashing: boolean
  setHighlight?: (id: string | null) => void
}) => {
  const [isHighlighted, setIsHighlighted] = useState(isFlashing)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isFlashing) return
    const interval = setInterval(() => {
      setIsHighlighted(!isHighlighted)
    }, 1000)

    return () => clearInterval(interval)
  }, [isFlashing, isHighlighted])

  useEffect(() => {
    const currentRef = ref.current
    if (!currentRef) return

    const handleFocus = (event: FocusEvent) => {
      if (currentRef.contains(event.target as Node)) {
        setHighlight?.(null)
        setIsHighlighted(false)
      }
    }

    document.addEventListener("focus", handleFocus, true)

    return () => {
      document.removeEventListener("focus", handleFocus, true)
    }
  }, [setHighlight])

  return (
    <div
      ref={ref}
      className={`transition-all duration-300 ${isHighlighted ? `${from} border border-primary-main p-2` : `${to} border-0 border-transparent`}`}>
      {children}
    </div>
  )
}

export { HighlightSection }
