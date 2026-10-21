import React, { useEffect, useRef, useState } from "react"

import { Button } from "../Button"
import { CopyOutlined } from "@loft-enterprise/icons"

interface ExpandableErrorDetailsProps {
  errMessage: string
  onExpandedChange?: (expanded: boolean) => void
}

const COLLAPSED_MAX_HEIGHT = 96

export const ExpandableErrorDetails: React.FC<ExpandableErrorDetailsProps> = ({
  errMessage,
  onExpandedChange,
}) => {
  const [expanded, setExpanded] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [contentHeight, setContentHeight] = useState(0)

  const needsExpansion = contentHeight > COLLAPSED_MAX_HEIGHT

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight)
    }
  }, [errMessage])

  // Collapse on click outside the toast
  useEffect(() => {
    if (!expanded) return

    const handlePointerDown = (e: PointerEvent) => {
      const toastEl = containerRef.current?.closest("[data-state]")
      if (!toastEl || !toastEl.contains(e.target as Node)) {
        setExpanded(false)
        onExpandedChange?.(false)
      }
    }

    document.addEventListener("pointerdown", handlePointerDown)

    return () => document.removeEventListener("pointerdown", handlePointerDown)
  }, [expanded, onExpandedChange])

  const handleToggle = () => {
    const next = !expanded
    setExpanded(next)
    onExpandedChange?.(next)
  }

  return (
    <div ref={containerRef} className="flex flex-col gap-2">
      <div
        style={
          needsExpansion
            ? {
                maxHeight: expanded
                  ? "min(60dvh, " + contentHeight + "px)"
                  : COLLAPSED_MAX_HEIGHT + "px",
                transition: "max-height 250ms cubic-bezier(0.23, 1, 0.32, 1)",
              }
            : undefined
        }
        className={needsExpansion ? "overflow-auto" : undefined}>
        <div ref={contentRef} onPointerDown={(e) => e.stopPropagation()}>
          <pre className="mb-0 cursor-text select-text whitespace-pre-wrap text-sm [overflow-wrap:anywhere]">
            {errMessage}
          </pre>
        </div>
      </div>
      <div className="flex flex-row gap-2">
        <Button
          variant="outlined"
          onClick={() => {
            navigator.clipboard.writeText(errMessage)
          }}>
          <CopyOutlined /> Copy
        </Button>
        {needsExpansion && (
          <Button variant="ghost" onClick={handleToggle}>
            {expanded ? "Show less" : "Show more"}
          </Button>
        )}
      </div>
    </div>
  )
}
