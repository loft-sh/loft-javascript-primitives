import { RefObject, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"

const ROW_HEIGHT_DEFAULT = 72
const ROW_HEIGHT_SLIM = 48
const BOTTOM_BAR_HEIGHT = 36
const PAGINATION_RESERVE = 80
const BUFFER = 8
const MIN_PAGE_SIZE = 10
const MAX_PAGE_SIZE = 50

type Opts = {
  enabled: boolean
  tableRef: RefObject<HTMLElement>
  variant: "default" | "slim"
  headerHeight?: number
  rowCount?: number
  rowRef?: RefObject<HTMLElement>
  headerRef?: RefObject<HTMLElement>
}

export type AutoFitResult = {
  pageSize: number | null
  isOverridden: boolean
  markOverridden: () => void
}

export function useAutoFitPageSize({
  enabled,
  tableRef,
  variant,
  headerHeight = 37,
  rowCount,
  rowRef,
  headerRef,
}: Opts): AutoFitResult {
  const [pageSize, setPageSize] = useState<number | null>(null)
  const [isOverridden, setIsOverridden] = useState(false)
  const overriddenRef = useRef(false)

  const compute = useCallback(() => {
    if (!enabled || overriddenRef.current) return
    const el = tableRef.current
    if (!el) return

    const fallbackRowH = variant === "slim" ? ROW_HEIGHT_SLIM : ROW_HEIGHT_DEFAULT
    const measuredRow = rowRef?.current?.getBoundingClientRect().height
    const rowH = measuredRow && measuredRow > 0 ? measuredRow : fallbackRowH
    const measuredHeader = headerRef?.current?.getBoundingClientRect().height
    const headerH = measuredHeader && measuredHeader > 0 ? measuredHeader : headerHeight
    const chromeAbove = el.getBoundingClientRect().top
    const chromeBelow = BOTTOM_BAR_HEIGHT + PAGINATION_RESERVE + BUFFER
    const available = window.innerHeight - chromeAbove - chromeBelow - headerH
    const fit = Math.floor(available / rowH)
    const clamped = Math.max(MIN_PAGE_SIZE, Math.min(MAX_PAGE_SIZE, fit))

    setPageSize((prev) => (prev === clamped ? prev : clamped))
  }, [enabled, tableRef, variant, headerHeight, rowRef, headerRef])

  useLayoutEffect(() => {
    if (!enabled) {
      setPageSize(null)

      return
    }
    compute()
  }, [enabled, compute, rowCount])

  useEffect(() => {
    if (!enabled) return

    const onResize = () => compute()
    window.addEventListener("resize", onResize)

    let ro: ResizeObserver | undefined
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(onResize)
      ro.observe(document.documentElement)
    }

    return () => {
      window.removeEventListener("resize", onResize)
      ro?.disconnect()
    }
  }, [enabled, compute])

  const markOverridden = useCallback(() => {
    overriddenRef.current = true
    setIsOverridden(true)
  }, [])

  return { pageSize, isOverridden, markOverridden }
}
