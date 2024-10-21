import { Table } from "@tanstack/react-table"
import React, { useEffect, useState } from "react"

type Props<TData> = {
  tableRef: React.RefObject<HTMLTableElement>
  table: Table<TData>
}

const TOLERANCE = 10
function useMenuVisibility<TData>({ tableRef, table }: Props<TData>) {
  const tableSize = table.getTotalSize()
  const [shouldTableBeFullWidth, setShouldTableBeFullWidth] = useState(() => {
    if (!tableRef.current) return false

    return table.getTotalSize() <= tableRef.current.clientWidth
  })
  const [shouldMenuBeFixed, setShouldMenuBeFixed] = useState(() => {
    if (!tableRef.current) return false
    const { scrollLeft, scrollWidth, clientWidth } = tableRef.current

    return scrollLeft + clientWidth >= scrollWidth + TOLERANCE
  })

  useEffect(() => {
    if (!tableRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = tableRef.current
    const tableRefMemo = tableRef.current
    const handleScroll = () => {
      if (!tableRef.current) return
      const { scrollLeft, scrollWidth, clientWidth } = tableRef.current
      setShouldMenuBeFixed(scrollLeft + clientWidth >= scrollWidth - TOLERANCE)
    }

    const handleResize = () => {
      if (!tableRef.current) return
      const { scrollLeft, scrollWidth, clientWidth } = tableRef.current
      setShouldTableBeFullWidth(() => table.getTotalSize() <= clientWidth + TOLERANCE)
      setShouldMenuBeFixed(scrollLeft + clientWidth >= scrollWidth - TOLERANCE)
    }

    tableRef.current.addEventListener("scroll", handleScroll)

    setShouldTableBeFullWidth(() => table.getTotalSize() <= clientWidth + TOLERANCE)

    setShouldMenuBeFixed(() => scrollLeft + clientWidth >= scrollWidth - TOLERANCE)

    window.addEventListener("resize", handleResize)
    window.addEventListener("resize", handleScroll)

    return () => {
      tableRefMemo.removeEventListener("scroll", handleScroll)
      window.removeEventListener("resize", handleScroll)
      window.removeEventListener("resize", handleResize)
    }
  }, [tableSize, tableRef, table])

  useEffect(() => {
    if (!tableRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = tableRef.current
    setShouldMenuBeFixed(() => {
      return !shouldTableBeFullWidth ? false : scrollLeft + clientWidth >= scrollWidth - TOLERANCE
    })
  }, [shouldTableBeFullWidth, tableRef])

  return { shouldMenuAppearOnHover: shouldMenuBeFixed, shouldTableBeFullWidth }
}

export default useMenuVisibility
