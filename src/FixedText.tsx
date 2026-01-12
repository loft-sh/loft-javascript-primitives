import React, { CSSProperties, useCallback, useEffect, useRef, useState } from "react"

import cn from "../clsx"

type FixedTextProps = {
  children: React.ReactNode
  maxWidth?: number
  parentElement?: keyof HTMLElementTagNameMap
  style?: CSSProperties
  offset?: number
  className?: string
  renderWithTruncation?: (isTruncated: boolean, children: React.ReactNode) => React.ReactNode
}

/**
 * A component that displays text with automatic truncation detection and optional responsive width handling.
 *
 * **Features:**
 * - Automatically truncates text with ellipsis when content exceeds available width
 * - Detects truncation state and exposes it via render prop
 * - Observes parent container for resize events and updates accordingly
 * - Integrates seamlessly with tooltips to show full text on hover when truncated
 * - Memory-safe with proper cleanup of animation frames and observers
 *
 * @param props - Component props
 * @param props.children - The content to display (text, elements, etc.)
 * @param props.maxWidth - Maximum width in pixels. Text will truncate if content exceeds this width
 * @param props.parentElement - HTML element tag to observe for width changes (e.g., "td" for table cells). When specified, the component will measure and observe this ancestor element for resizing
 * @param props.style - Additional inline styles to apply to the container
 * @param props.offset - Number of pixels to subtract from the calculated width (useful for padding/margins). Defaults to 0
 * @param props.className - Additional CSS classes to apply to the container
 * @param props.renderWithTruncation - Render prop that receives `(isTruncated: boolean, content: ReactNode)` and returns the content, optionally wrapped with additional UI like Tooltip
 *
 * @example
 * // Basic usage with fixed width
 * <FixedText maxWidth={200}>
 *   This is a long text that will be truncated if it exceeds 200px
 * </FixedText>
 *
 * @example
 * // With tooltip integration (shows tooltip only when truncated)
 * <FixedText
 *   maxWidth={130}
 *   renderWithTruncation={(isTruncated, content) =>
 *     isTruncated ? <Tooltip content="Full text here">{content}</Tooltip> : content
 *   }
 * >
 *   Long text that might be truncated
 * </FixedText>
 *
 * @example
 * // Responsive table cell width (observes column resizing)
 * <td>
 *   <FixedText
 *     parentElement="td"
 *     renderWithTruncation={(isTruncated, content) =>
 *       isTruncated ? <Tooltip content={fullText}>{content}</Tooltip> : content
 *     }
 *   >
 *     {cellContent}
 *   </FixedText>
 * </td>
 */
const FixedText: React.FC<FixedTextProps> = ({
  children,
  maxWidth,
  parentElement,
  style,
  className,
  offset = 0,
  renderWithTruncation,
}) => {
  const ref = useRef<HTMLDivElement>(null)
  const [effectiveMaxWidth, setEffectiveMaxWidth] = useState<string | number>(maxWidth ?? "100%")
  const [isTruncated, setIsTruncated] = useState(false)
  const rafIdRef = useRef<number | null>(null)

  const checkTruncation = useCallback(() => {
    if (!ref.current) return
    const element = ref.current
    const truncated = element.scrollWidth > element.clientWidth + 1
    setIsTruncated(truncated)
  }, [])

  const scheduleCheckTruncation = useCallback(() => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current)
    }
    rafIdRef.current = requestAnimationFrame(() => {
      checkTruncation()
      rafIdRef.current = null
    })
  }, [checkTruncation])

  const updateWidth = useCallback(() => {
    if (!ref.current) return

    if (parentElement) {
      const parent = ref.current.closest(parentElement)
      if (!parent) return

      const parentWidth = parent.clientWidth - offset
      const isOverflow = parentWidth <= (maxWidth ?? 100) + offset

      setEffectiveMaxWidth(isOverflow ? parentWidth : "100%")
    } else {
      const parentWidth = ref.current.parentElement?.clientWidth

      if (maxWidth !== undefined) {
        if (parentWidth) {
          const availableWidth = parentWidth - offset
          setEffectiveMaxWidth(Math.min(availableWidth, maxWidth))
        } else {
          setEffectiveMaxWidth(maxWidth)
        }
      } else {
        if (parentWidth) {
          setEffectiveMaxWidth(parentWidth - offset)
        } else {
          setEffectiveMaxWidth("100%")
        }
      }
    }
  }, [maxWidth, parentElement, offset])

  useEffect(() => {
    updateWidth()
    scheduleCheckTruncation()

    if (!ref.current) return

    const observeTarget = parentElement
      ? ref.current.closest(parentElement)
      : ref.current.parentElement

    if (!observeTarget) return

    const handleUpdate = () => {
      updateWidth()
      scheduleCheckTruncation()
    }

    const resizeObserver = new ResizeObserver(handleUpdate)
    resizeObserver.observe(observeTarget)

    return () => {
      resizeObserver.disconnect()
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current)
        rafIdRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parentElement, maxWidth, offset])

  useEffect(() => {
    scheduleCheckTruncation()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveMaxWidth, children])

  if (!children) {
    return null
  }

  const content = (
    <div
      ref={ref}
      style={{ maxWidth: effectiveMaxWidth, ...style }}
      className={cn("overflow-hidden text-ellipsis whitespace-nowrap", className)}>
      {children}
    </div>
  )

  if (renderWithTruncation) {
    return <>{renderWithTruncation(isTruncated, content)}</>
  }

  return content
}

export { FixedText }
