import cn from "clsx"
import React, { useLayoutEffect, useMemo, useRef, useState } from "react"

export type AutoGridProps = {
  minColumnWidth: number
  maxColumnWidth: number
  minGapWidth: number
  maxGapWidth: number
  children?: React.ReactNode
  className?: string
  wrapperClassName?: string
  /** Number of columns to enforce. When set, disables wrapping and enables horizontal scroll. */
  fixedColumns?: number
}

type ColumnLayout = {
  columns: number
  columnWidth: number
  additionalGap: number
}

export function AutoGrid({
  minColumnWidth,
  maxColumnWidth,
  minGapWidth,
  maxGapWidth,
  children,
  wrapperClassName,
  className,
  fixedColumns,
}: AutoGridProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)

  const [width, setWidth] = useState(0)

  useLayoutEffect(() => {
    const el = wrapperRef.current

    if (!el) {
      return
    }

    const updateWidth = () => {
      setWidth(el.getBoundingClientRect().width)
    }

    const resizeObserver = new ResizeObserver(updateWidth)

    resizeObserver.observe(el)

    updateWidth()

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  const { columnWidth, columns, additionalGap } = useMemo(() => {
    // Initial cycle might not have a width measured, but this shouldn't really be visible.
    if (!width) {
      return { columnWidth: minColumnWidth, columns: fixedColumns ?? 1, additionalGap: 0 }
    }

    // Fixed columns mode: use all columns, scroll if needed
    if (fixedColumns !== undefined) {
      const result = computeColumnLayout(
        width,
        minColumnWidth,
        maxColumnWidth,
        minGapWidth,
        maxGapWidth,
        fixedColumns
      )

      if (!result) {
        return { columnWidth: minColumnWidth, columns: fixedColumns, additionalGap: 0 }
      }

      return result
    }

    const result = computeColumnLayout(
      width,
      minColumnWidth,
      maxColumnWidth,
      minGapWidth,
      maxGapWidth
    )

    // Expand error case or single column to full width.
    if (!result || result.columns === 1) {
      return { columnWidth: width, columns: 1, additionalGap: 0 }
    }

    return result
  }, [width, minColumnWidth, minGapWidth, maxColumnWidth, maxGapWidth, fixedColumns])

  const isOverflowing = fixedColumns !== undefined

  return (
    <div
      className={cn("flex w-full flex-row", isOverflowing && "overflow-x-auto", wrapperClassName)}
      ref={wrapperRef}>
      <div
        className={cn("grid gap-6", isOverflowing ? "w-max" : "w-full", className)}
        style={{
          gridTemplateColumns: `repeat(${columns},${columnWidth}px)`,
          columnGap: `${minGapWidth + additionalGap}px`,
        }}>
        {children}
      </div>
    </div>
  )
}

/**
 * Calculates the amount of columns of a minimum size that we can fit in a container.
 * @param containerWidth Total width of the container
 * @param minWidth Minimum size for columns
 * @param gap Gap between the columns
 */
function calculateMaxColumns(containerWidth: number, minWidth: number, gap: number) {
  // We add another gap at the end so we can nicely divide with gap size.
  // In practice this addition is not relevant but it lets us do a nicer calculation.
  const maxColumnsByMin = Math.floor((containerWidth + gap) / (minWidth + gap))

  // We need to support at least one column at all times.
  return Math.max(1, maxColumnsByMin)
}

/**
 * Calculates specifications for an automatic grid layout that has a constant column size within a given range
 * and variable gap size. This should minimize the amount of left-over whitespace on the right side.
 * @param containerWidth Total width of the container
 * @param minWidth Minimum size for columns
 * @param maxWidth Maximum size for columns
 * @param targetGap The desired gap for the columns / minimum gap size.
 * @param maxGap The maximum size the gap can expand to
 * @param fixedColumnCount Optional fixed number of columns (disables auto-calculation)
 */
function computeColumnLayout(
  containerWidth: number,
  minWidth: number,
  maxWidth: number,
  targetGap: number,
  maxGap: number,
  fixedColumnCount?: number
): ColumnLayout | null {
  if (!Number.isFinite(containerWidth) || containerWidth <= 0) {
    return null
  }

  // Use fixed column count if provided, otherwise calculate max columns
  const columnCount = fixedColumnCount ?? calculateMaxColumns(containerWidth, minWidth, targetGap)

  const gapCount = columnCount - 1

  const totalGapSize = targetGap * gapCount
  const spaceWithoutGaps = containerWidth - totalGapSize

  const availableSizePerColumn = Math.floor(spaceWithoutGaps / columnCount)

  // For fixed columns, use min width if space is insufficient, otherwise expand up to max
  const columnSize =
    fixedColumnCount !== undefined
      ? Math.max(minWidth, Math.min(maxWidth, availableSizePerColumn))
      : Math.min(maxWidth, availableSizePerColumn)

  // See if we can grow the gaps some more to fill up some remaining space.
  if (gapCount >= 1 && availableSizePerColumn >= minWidth) {
    const totalColumnSpace = columnSize * columnCount
    const leftOverSpace = spaceWithoutGaps - totalColumnSpace

    const desiredAdditionalGap = Math.floor(leftOverSpace / gapCount)
    const additionalGap = Math.min(maxGap - targetGap, desiredAdditionalGap)

    return { columns: columnCount, columnWidth: columnSize, additionalGap }
  }

  return { columns: columnCount, columnWidth: columnSize, additionalGap: 0 }
}
