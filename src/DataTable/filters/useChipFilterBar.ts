import { useMemo, useState } from "react"

import { ChipFilter, FilterDefinitions } from "./definitions"
import type { FilterState, FilterValues } from "./useFilterState"

export type ChipFilterBar<K extends string = string> = {
  values: FilterValues<K>
  setValue: (id: K, value: readonly string[]) => void
  chips: ChipFilter<K>[]
  addable: ChipFilter<K>[]
  openId: K | null
  add: (id: K) => void
  dismissAdd: () => void
  open: (id: K) => void
  hide: () => void
  closeChip: (id: K) => void
  removeChip: (id: K) => void
  clearChips: () => void
}

export function useChipFilterBar<T, K extends string>(
  filters: FilterDefinitions<T, K>,
  { values, setValue }: Pick<FilterState<T, K>, "values" | "setValue">
): ChipFilterBar<K> {
  const [pendingId, setPendingId] = useState<K | null>(null)
  const [openId, setOpenId] = useState<K | null>(null)

  const chipFilters = useMemo(() => {
    const defined: ChipFilter<K>[] = []
    for (const id in filters) {
      const filter = filters[id]
      if (filter && filter.type !== "text") defined.push({ id, ...filter })
    }

    return defined
  }, [filters])
  const isEmptyChipShown = (id: K) => !values[id] && (id === pendingId || id === openId)

  const closeChip = (id: K) => {
    setOpenId(null)
    setPendingId((current) => (current === id ? null : current))
  }

  return {
    values,
    setValue,
    chips: [
      ...Object.keys(values).flatMap((id) => chipFilters.filter((chip) => chip.id === id)),
      ...chipFilters.filter((chip) => isEmptyChipShown(chip.id)),
    ],
    addable: chipFilters.filter(
      (chip) =>
        !values[chip.id] &&
        !isEmptyChipShown(chip.id) &&
        (chip.type === "dateRange" || chip.options.length > 0)
    ),
    openId,
    add: (id) => {
      setPendingId(id)
      setOpenId(id)
    },
    dismissAdd: () => setPendingId(null),
    open: setOpenId,
    hide: () => setOpenId(null),
    closeChip,
    removeChip: (id) => {
      closeChip(id)
      setValue(id, [])
    },
    clearChips: () => {
      setPendingId(null)
      setOpenId(null)
      chipFilters.forEach(({ id }) => setValue(id, []))
    },
  }
}
