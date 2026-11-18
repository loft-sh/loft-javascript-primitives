import { RefObject, useCallback, useEffect, useLayoutEffect } from "react"

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
  onFit: (pageSize: number) => void
  headerHeight?: number
  rowCount?: number
  rowRef?: RefObject<HTMLElement>
  headerRef?: RefObject<HTMLElement>
}

export function useAutoFitPageSize({
  enabled,
  tableRef,
  variant,
  onFit,
  headerHeight = 37,
  rowCount,
  rowRef,
  headerRef,
}: Opts) {
  const compute = useCallback(() => {
    const el = tableRef.current
    if (!enabled || !el) return

    const fallbackRowH = variant === "slim" ? ROW_HEIGHT_SLIM : ROW_HEIGHT_DEFAULT
    const measuredRow = rowRef?.current?.getBoundingClientRect().height
    const rowH = measuredRow && measuredRow > 0 ? measuredRow : fallbackRowH
    const measuredHeader = headerRef?.current?.getBoundingClientRect().height
    const headerH = measuredHeader && measuredHeader > 0 ? measuredHeader : headerHeight
    const chromeAbove = el.getBoundingClientRect().top
    const chromeBelow = BOTTOM_BAR_HEIGHT + PAGINATION_RESERVE + BUFFER
    const available = window.innerHeight - chromeAbove - chromeBelow - headerH
    const fit = Math.floor(available / rowH)

    onFit(Math.max(MIN_PAGE_SIZE, Math.min(MAX_PAGE_SIZE, fit)))
  }, [enabled, tableRef, variant, headerHeight, rowRef, headerRef, onFit])

  useLayoutEffect(() => {
    compute()
  }, [compute, rowCount])

  useEffect(() => {
    if (!enabled) return

    window.addEventListener("resize", compute)

    let ro: ResizeObserver | undefined
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(compute)
      ro.observe(document.documentElement)
    }

    return () => {
      window.removeEventListener("resize", compute)
      ro?.disconnect()
    }
  }, [enabled, compute])
}
