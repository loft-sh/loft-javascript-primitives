import * as React from "react"
import { useLayoutEffect, useMemo, useRef, useState } from "react"

export type OverflowChipVisibility = {
  visibleItems: string[]
  overflowItemCount: number
}

type UseOverflowChipVisibilityOptions = {
  chipGapPx: number
  overflowTailPx: number
}

export function useOverflowChipVisibility(
  values: string[],
  { chipGapPx, overflowTailPx }: UseOverflowChipVisibilityOptions
) {
  const measurerRef = useRef<HTMLDivElement>(null)
  const valueContainerRef = useRef<HTMLDivElement>(null)

  const itemRefs = useMemo(() => values.map(() => React.createRef<HTMLDivElement>()), [values])

  const [itemSizes, setItemSizes] = useState<Record<number, number>>({})
  const [containerSize, setContainerSize] = useState<number>(0)

  useLayoutEffect(() => {
    const updateItemSizes = () => {
      const widths: Record<number, number> = {}
      itemRefs.forEach((itemRef, i) => {
        if (itemRef.current) {
          const { width } = itemRef.current.getBoundingClientRect()
          widths[i] = width
        }
      })
      setItemSizes(widths)
    }

    const updateContainerSize = () => {
      if (!valueContainerRef.current) {
        return
      }

      const rect = valueContainerRef.current.getBoundingClientRect()
      setContainerSize(rect.width)
    }

    const itemsResizeObserver = new ResizeObserver(updateItemSizes)
    if (measurerRef.current) {
      itemsResizeObserver.observe(measurerRef.current)
    }

    const containerResizeObserver = new ResizeObserver(updateContainerSize)
    if (valueContainerRef.current) {
      containerResizeObserver.observe(valueContainerRef.current)
    }
    updateItemSizes()
    updateContainerSize()

    return () => {
      itemsResizeObserver.disconnect()
      containerResizeObserver.disconnect()
    }
  }, [itemRefs])

  const [visibility, setVisibility] = useState<OverflowChipVisibility>({
    visibleItems: [],
    overflowItemCount: 0,
  })

  useLayoutEffect(() => {
    if (!values.length) {
      setVisibility({ visibleItems: [], overflowItemCount: 0 })

      return
    }

    // ALWAYS show the first item. It gets nicely truncated if necessary.
    const visibleItems = [values[0]!]

    if (values.length === 1) {
      setVisibility({ visibleItems, overflowItemCount: 0 })

      return
    }

    let accumulatedLength = itemSizes[0] ?? 0

    for (let i = 1; i < values.length; i++) {
      const length = itemSizes[i] ?? 0
      accumulatedLength += length + chipGapPx

      const availableSize = i === values.length - 1 ? containerSize : containerSize - overflowTailPx

      if (accumulatedLength > availableSize) {
        break
      }

      visibleItems.push(values[i]!)
    }

    setVisibility({ visibleItems, overflowItemCount: values.length - visibleItems.length })
  }, [itemSizes, containerSize, values, chipGapPx, overflowTailPx])

  return { measurerRef, valueContainerRef, itemRefs, visibility }
}
