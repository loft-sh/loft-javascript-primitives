import React, { useCallback, useEffect, useRef, useState } from "react"

import { cn } from "../../cn-utils"
import { clamp } from "@loft-enterprise/shared"

const CSS_VAR = "--split-position"

export type SplitPaneProps = {
  disableDrag?: boolean

  leftPane: React.ReactNode
  rightPane: React.ReactNode

  className?: string
  style?: React.CSSProperties

  gridClassName?: string
  gridStyle?: React.CSSProperties

  minLeft?: number
  minRight?: number

  enabled?: boolean

  initialSplitPosition: number

  transition?: string

  leftPaneClassName?: string
  rightPaneClassName?: string

  storePosition?: (position: number) => void
}

export function SplitPane({
  disableDrag,
  leftPane,
  rightPane,
  className,
  style,
  gridClassName,
  gridStyle,
  minLeft = 0,
  minRight = 0,
  initialSplitPosition,
  leftPaneClassName,
  rightPaneClassName,
  transition = "all 0.15s cubic-bezier(0.25, 0.8, 0.25, 1)",
  storePosition,
}: SplitPaneProps) {
  const [splitPosition, setSplitPosition] = useState(initialSplitPosition)
  const [dragging, setDragging] = useState(false)

  const outerRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const dragStartXRef = useRef(0)
  const initialLeftRef = useRef(splitPosition)
  const rafIdRef = useRef<number | null>(null)
  const containerWidthRef = useRef<number>(0)
  const resetBaseRef = useRef<number>(initialSplitPosition)

  const liveSplitPositionRef = useRef<number>(splitPosition)

  const clampLeftWidth = useCallback(
    (proposed: number): number => {
      const containerWidth =
        containerWidthRef.current || containerRef.current?.getBoundingClientRect().width || 0
      if (!containerWidth) return proposed

      const max = Math.max(minLeft, Math.round(containerWidth - minRight))

      return clamp(proposed, minLeft, max)
    },
    [containerRef, minLeft, minRight]
  )

  // Apply committed width to the container as a CSS var when enabled
  useEffect(() => {
    const clamped = clampLeftWidth(splitPosition)
    liveSplitPositionRef.current = clamped
    outerRef.current?.style.setProperty(CSS_VAR, `${clamped}px`)
  }, [containerRef, splitPosition, clampLeftWidth])

  // While dragging: update CSS variable via rAF so we avoid flooding the DOM with hundreds of setProperty calls
  useEffect(() => {
    if (!dragging) return

    const onMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragStartXRef.current
      const newWidth = clampLeftWidth(initialLeftRef.current + deltaX)
      liveSplitPositionRef.current = newWidth
      if (rafIdRef.current == null) {
        rafIdRef.current = window.requestAnimationFrame(() => {
          rafIdRef.current = null
          outerRef.current?.style.setProperty(CSS_VAR, `${liveSplitPositionRef.current}px`)
        })
      }
    }

    const stopDragging = () => {
      setDragging(false)
      const finalWidth = clampLeftWidth(liveSplitPositionRef.current)
      setSplitPosition(finalWidth)
      storePosition?.(finalWidth)

      if (rafIdRef.current != null) {
        cancelAnimationFrame(rafIdRef.current)
        rafIdRef.current = null
      }
    }

    document.addEventListener("mousemove", onMouseMove)
    document.addEventListener("mouseup", stopDragging)

    return () => {
      document.removeEventListener("mousemove", onMouseMove)
      document.removeEventListener("mouseup", stopDragging)
    }
  }, [dragging, clampLeftWidth, containerRef, storePosition])

  // Disable text selection while dragging
  useEffect(() => {
    if (!dragging) return
    const prev = document.body.style.userSelect
    document.body.style.userSelect = "none"

    return () => {
      document.body.style.userSelect = prev
    }
  }, [dragging])

  // Clamp when the container resizes
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const ro = new ResizeObserver(() => {
      const rect = el.getBoundingClientRect()
      containerWidthRef.current = rect.width
      const clamped = clampLeftWidth(splitPosition)
      // Apply visually; keep desired width state intact
      liveSplitPositionRef.current = clamped
      outerRef.current?.style.setProperty(CSS_VAR, `${clamped}px`)
    })
    ro.observe(el)

    return () => ro.disconnect()
  }, [containerRef, splitPosition, clampLeftWidth, minLeft, minRight])

  // Track reset base when default changes upstream
  useEffect(() => {
    resetBaseRef.current = initialSplitPosition
  }, [initialSplitPosition])

  const startDragging = useCallback(
    (e: React.MouseEvent) => {
      const el = containerRef.current
      containerWidthRef.current = el?.getBoundingClientRect().width || 0
      dragStartXRef.current = e.clientX
      initialLeftRef.current = splitPosition
      setDragging(true)
      e.preventDefault()
    },
    [containerRef, splitPosition]
  )

  const applyAndCommit = useCallback(
    (value: number) => {
      const clamped = clampLeftWidth(value)
      setSplitPosition(clamped)
      storePosition?.(clamped)
      outerRef.current?.style.setProperty(CSS_VAR, `${clamped}px`)
    },
    [clampLeftWidth, storePosition]
  )

  const resetToDefault = useCallback(() => {
    applyAndCommit(resetBaseRef.current)
  }, [applyAndCommit])

  const computeMaxLeft = (): number => {
    const w =
      containerWidthRef.current ||
      (containerRef.current ? containerRef.current.getBoundingClientRect().width : 0)
    if (!w) return splitPosition

    return Math.max(minLeft, Math.round(w - minRight))
  }

  const maxLeft = computeMaxLeft()

  return (
    <div
      className={cn("relative w-full flex-grow overflow-hidden", className)}
      style={style}
      ref={outerRef}>
      <div
        style={{
          maxWidth: "100%",
          transition: dragging ? "none" : transition,
          ...(gridStyle as React.CSSProperties),
        }}
        className={cn(
          "grid h-full w-full grid-cols-[var(--split-position),1px,calc(100%-var(--split-position)-1px)]",
          gridClassName
        )}
        ref={containerRef}>
        <div className={cn("flex h-full flex-col", leftPaneClassName)}>{leftPane}</div>
        <div className={"relative h-full bg-divider-main"}>
          {!disableDrag && (
            <div
              onMouseDown={startDragging}
              onDoubleClick={resetToDefault}
              role="separator"
              aria-orientation="vertical"
              aria-label="Resize editor panel"
              aria-valuemin={minLeft}
              aria-valuemax={isFinite(maxLeft) ? maxLeft : undefined}
              aria-valuenow={splitPosition}
              tabIndex={0}
              className={cn(
                "group absolute left-[-1px] top-0 z-top-level h-full w-[3px] cursor-col-resize touch-none select-none"
              )}>
              <div
                className={cn("absolute left-[1px] top-0 h-full w-[1px]", {
                  "bg-neutral-dark outline outline-1 outline-neutral-dark": dragging,
                  "group-hover:bg-neutral-dark group-hover:outline group-hover:outline-1 group-hover:outline-neutral-dark":
                    !dragging,
                })}
              />
            </div>
          )}
        </div>
        <div className={cn("flex h-full flex-col", rightPaneClassName)}>{rightPane}</div>
      </div>
    </div>
  )
}
