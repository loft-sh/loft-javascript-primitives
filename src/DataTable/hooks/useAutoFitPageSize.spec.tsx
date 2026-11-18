import { act, renderHook } from "@testing-library/react"
import { useRef } from "react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { useAutoFitPageSize } from "./useAutoFitPageSize"

function setViewportHeight(px: number) {
  Object.defineProperty(window, "innerHeight", { configurable: true, value: px, writable: true })
  window.dispatchEvent(new Event("resize"))
}

function makeElement<K extends "table" | "tr" | "thead">(tag: K, top: number, height: number) {
  const el = document.createElement(tag)
  document.body.appendChild(el)
  el.getBoundingClientRect = () =>
    ({
      top,
      left: 0,
      right: 0,
      bottom: top + height,
      width: 0,
      height,
      x: 0,
      y: top,
      toJSON: () => ({}),
    }) as DOMRect

  return el
}

function renderFit({
  enabled,
  variant = "default",
  tableTop = 200,
  rowHeight,
  headerHeight,
}: {
  enabled: boolean
  variant?: "default" | "slim"
  tableTop?: number
  rowHeight?: number
  headerHeight?: number
}) {
  const tableEl = makeElement("table", tableTop, 0)
  const rowEl = rowHeight == null ? null : makeElement("tr", 0, rowHeight)
  const headerEl = headerHeight == null ? null : makeElement("thead", 0, headerHeight)
  const onFit = vi.fn<(pageSize: number) => void>()
  const hook = renderHook(
    (props: { enabled: boolean }) => {
      const tableRef = useRef<HTMLTableElement>(tableEl)
      const rowRef = useRef(rowEl)
      const headerRef = useRef(headerEl)
      useAutoFitPageSize({ enabled: props.enabled, tableRef, variant, onFit, rowRef, headerRef })
    },
    { initialProps: { enabled } }
  )

  return { ...hook, onFit, lastFit: () => onFit.mock.lastCall?.[0] }
}

describe("useAutoFitPageSize", () => {
  const ORIGINAL_INNER_HEIGHT = window.innerHeight

  afterEach(() => {
    document.body.replaceChildren()
    Object.defineProperty(window, "innerHeight", {
      configurable: true,
      value: ORIGINAL_INNER_HEIGHT,
      writable: true,
    })
  })

  it("fits the rows that the space below the table holds", () => {
    setViewportHeight(1500)

    expect(renderFit({ enabled: true }).lastFit()).toBe(15)
  })

  it("fits more slim rows than default rows in the same space", () => {
    setViewportHeight(1500)

    expect(renderFit({ enabled: true, variant: "slim" }).lastFit()).toBe(23)
  })

  it("clamps to 10 rows on a small viewport and to 50 rows on a large one", () => {
    setViewportHeight(400)
    expect(renderFit({ enabled: true }).lastFit()).toBe(10)

    setViewportHeight(8000)
    expect(renderFit({ enabled: true, tableTop: 100 }).lastFit()).toBe(50)
  })

  it("uses the measured row and header heights instead of the defaults", () => {
    setViewportHeight(1500)

    expect(renderFit({ enabled: true, rowHeight: 40 }).lastFit()).toBe(28)
    expect(renderFit({ enabled: true, headerHeight: 100 }).lastFit()).toBe(14)
  })

  it("fits again when the window resizes", () => {
    setViewportHeight(1500)
    const { lastFit } = renderFit({ enabled: true })

    act(() => setViewportHeight(1200))

    expect(lastFit()).toBe(11)
  })

  it("does not fit while disabled and stops fitting once disabled", () => {
    setViewportHeight(1500)
    const disabled = renderFit({ enabled: false })
    act(() => setViewportHeight(1200))
    expect(disabled.onFit).not.toHaveBeenCalled()

    setViewportHeight(1500)
    const picked = renderFit({ enabled: true })
    picked.rerender({ enabled: false })
    act(() => setViewportHeight(1200))
    expect(picked.lastFit()).toBe(15)
  })
})
