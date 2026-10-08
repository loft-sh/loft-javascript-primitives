import { act, renderHook } from "@testing-library/react"
import { useRef } from "react"
import { afterEach, describe, expect, it } from "vitest"

import { useAutoFitPageSize } from "./useAutoFitPageSize"

function setViewportHeight(px: number) {
  Object.defineProperty(window, "innerHeight", { configurable: true, value: px, writable: true })
  window.dispatchEvent(new Event("resize"))
}

function makeTableEl(top: number) {
  const el = document.createElement("table")
  document.body.appendChild(el)
  el.getBoundingClientRect = () =>
    ({
      top,
      left: 0,
      right: 0,
      bottom: top + 0,
      width: 0,
      height: 0,
      x: 0,
      y: top,
      toJSON: () => ({}),
    }) as DOMRect

  return el
}

function makeRowEl(height: number) {
  const el = document.createElement("tr")
  el.getBoundingClientRect = () =>
    ({
      top: 0,
      left: 0,
      right: 0,
      bottom: height,
      width: 0,
      height,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    }) as DOMRect

  return el
}

function renderHookWithRefs(opts: {
  enabled: boolean
  variant: "default" | "slim"
  tableTop: number
  headerH?: number
}) {
  const tableEl = makeTableEl(opts.tableTop)

  return renderHook(() => {
    const tableRef = useRef<HTMLTableElement>(tableEl)

    return useAutoFitPageSize({
      enabled: opts.enabled,
      tableRef,
      variant: opts.variant,
      headerHeight: opts.headerH ?? 37,
    })
  })
}

describe("useAutoFitPageSize", () => {
  const ORIGINAL_INNER_HEIGHT = window.innerHeight

  afterEach(() => {
    document.querySelectorAll("table").forEach((el) => el.remove())
    Object.defineProperty(window, "innerHeight", {
      configurable: true,
      value: ORIGINAL_INNER_HEIGHT,
      writable: true,
    })
  })

  it("returns null when disabled, regardless of viewport", () => {
    setViewportHeight(2000)
    const { result } = renderHookWithRefs({
      enabled: false,
      variant: "default",
      tableTop: 200,
    })
    expect(result.current.pageSize).toBeNull()
  })

  it("clamps to floor of 10 on a tiny viewport", () => {
    setViewportHeight(400)
    const { result } = renderHookWithRefs({
      enabled: true,
      variant: "default",
      tableTop: 200,
    })
    expect(result.current.pageSize).toBe(10)
  })

  it("clamps to ceiling of 50 on a huge viewport", () => {
    setViewportHeight(8000)
    const { result } = renderHookWithRefs({
      enabled: true,
      variant: "default",
      tableTop: 100,
    })
    expect(result.current.pageSize).toBe(50)
  })

  it("returns more rows for slim variant than default at the same viewport", () => {
    setViewportHeight(1500)
    const { result: defaultR } = renderHookWithRefs({
      enabled: true,
      variant: "default",
      tableTop: 200,
    })
    const { result: slimR } = renderHookWithRefs({
      enabled: true,
      variant: "slim",
      tableTop: 200,
    })
    expect(slimR.current.pageSize).toBeGreaterThan(defaultR.current.pageSize as number)
  })

  it("recomputes on window resize", () => {
    setViewportHeight(1500)
    const { result } = renderHookWithRefs({
      enabled: true,
      variant: "default",
      tableTop: 200,
    })
    const initial = result.current.pageSize as number

    act(() => setViewportHeight(800))
    const shrunk = result.current.pageSize as number

    expect(shrunk).toBeLessThan(initial)
  })

  it("stops emitting new values after markOverridden", () => {
    setViewportHeight(1500)
    const { result } = renderHookWithRefs({
      enabled: true,
      variant: "default",
      tableTop: 200,
    })
    const initial = result.current.pageSize as number

    act(() => result.current.markOverridden())

    act(() => setViewportHeight(800))
    expect(result.current.pageSize).toBe(initial)
    expect(result.current.isOverridden).toBe(true)
  })

  it("measures the row ref height, overriding the fallback constant", () => {
    setViewportHeight(1500)
    const tableEl = makeTableEl(200)
    const rowRef: { current: HTMLTableRowElement | null } = { current: null }

    const { result, rerender } = renderHook(
      ({ rowCount }: { rowCount: number }) => {
        const tableRef = useRef<HTMLTableElement>(tableEl)

        return useAutoFitPageSize({
          enabled: true,
          tableRef,
          variant: "default",
          headerHeight: 37,
          rowCount,
          rowRef,
        })
      },
      { initialProps: { rowCount: 0 } }
    )

    const withFallbackRowHeight = result.current.pageSize as number

    act(() => {
      rowRef.current = makeRowEl(40)
      rerender({ rowCount: 1 })
    })

    const withMeasuredRowHeight = result.current.pageSize as number

    expect(withMeasuredRowHeight).toBeGreaterThan(withFallbackRowHeight)
  })
})
