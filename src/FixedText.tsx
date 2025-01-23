import React, { CSSProperties, useCallback, useEffect, useRef, useState } from "react"

import cn from "../clsx"

interface FixedTextProps {
  children: React.ReactNode
  maxWidth?: number
  parentElement?: string
  style?: CSSProperties
  offset?: number
  className?: string
}

const FixedText: React.FC<FixedTextProps> = ({
  children,
  maxWidth,
  parentElement,
  style,
  className,
  offset = 0,
}) => {
  const ref = useRef<HTMLDivElement>(null)
  const [effectiveMaxWidth, setEffectiveMaxWidth] = useState<string | number>(maxWidth ?? "100%")

  const updateWidth = useCallback(() => {
    if (!parentElement || !ref.current) return
    const parent = ref.current.closest(parentElement)

    if (!parent) return

    const parentWidth = parent.clientWidth - offset
    const isOverflow = parentWidth <= (maxWidth ?? 100) + offset

    setEffectiveMaxWidth(isOverflow ? parentWidth : "100%")
  }, [maxWidth, parentElement, offset])

  useEffect(() => {
    updateWidth()

    if (!parentElement || !ref.current) return

    const parent = ref.current.closest(parentElement)
    if (!parent) return

    const resizeObserver = new ResizeObserver(updateWidth)
    resizeObserver.observe(parent)

    return () => resizeObserver.disconnect()
  }, [updateWidth, parentElement])

  return (
    <div
      ref={ref}
      style={{ maxWidth: effectiveMaxWidth, ...style }}
      className={cn("overflow-hidden text-ellipsis whitespace-nowrap", className)}>
      {children}
    </div>
  )
}

export { FixedText }
