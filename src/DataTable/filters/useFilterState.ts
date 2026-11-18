import { useCallback, useMemo, useState } from "react"
import { useHistory, useLocation } from "react-router-dom"

export type FilterValue = [string, ...string[]]

// Runs only while the filter has a value, so the value is never empty.
export type FilterFn<T> = (row: T, value: FilterValue) => boolean

export type FilterValues<K extends string = string> = Partial<Record<K, FilterValue>>

export type FilterState<T, K extends string = string> = {
  values: FilterValues<K>
  setValue: (id: K, value: readonly string[]) => void
  reset: () => void
  isFiltered: boolean
  matches?: (row: T) => boolean
}

// Only the filter functions: what a filter looks like belongs to the component that shows it.
type FilterFunctions<T, K extends string> = Partial<Record<K, { filterFn?: FilterFn<T> }>>

type FilterEntry<T, K extends string> = { id: K; filterFn?: FilterFn<T> }

function getUrlKey(id: string, prefix: string | undefined) {
  return prefix ? `${prefix}${id.charAt(0).toUpperCase()}${id.slice(1)}` : id
}

function useFilterEntries<T, K extends string>(filters: FilterFunctions<T, K>) {
  return useMemo(() => {
    const defined: FilterEntry<T, K>[] = []
    for (const id in filters) {
      const filter = filters[id]
      if (filter) defined.push({ id, filterFn: filter.filterFn })
    }

    return defined
  }, [filters])
}

function useFilterMatches<T, K extends string>(
  entries: FilterEntry<T, K>[],
  values: FilterValues<K>
) {
  return useMemo(() => {
    const predicates = entries.flatMap(({ id, filterFn }) => {
      const value = values[id]

      return filterFn && value ? [(row: T) => filterFn(row, value)] : []
    })

    return predicates.length ? (row: T) => predicates.every((match) => match(row)) : undefined
  }, [entries, values])
}

// A filter without filterFn runs on the server: it only holds a value for the caller's query.
export function useFilterState<T, K extends string>(
  filters: FilterFunctions<T, K>,
  { urlPrefix }: { urlPrefix?: string } = {}
): FilterState<T, K> {
  const history = useHistory()
  const location = useLocation()

  const entries = useFilterEntries(filters)
  const ids = entries.map(({ id }) => id)
  const idsByKey = new Map(ids.map((id) => [getUrlKey(id, urlPrefix), id]))
  // A string key keeps the values object stable while other URL params change.
  const valuesKey = new URLSearchParams(
    [...new URLSearchParams(location.search)].flatMap(([key, value]) => {
      const id = idsByKey.get(key)

      return id && value ? [[id, value]] : []
    })
  ).toString()
  const values = useMemo(() => {
    const next: FilterValues = {}
    new URLSearchParams(valuesKey).forEach((value, id) => {
      const existing = next[id]
      next[id] = existing ? [...existing, value] : [value]
    })

    return next
  }, [valuesKey])

  const write = useCallback(
    (next: Map<string, readonly string[]>) => {
      // Keeps each key at its first position, so the chip order survives edits and reloads.
      const params: string[][] = []
      const written = new Set<string>()
      new URLSearchParams(history.location.search).forEach((value, key) => {
        const nextValues = next.get(key)
        if (!nextValues) {
          params.push([key, value])
        } else if (!written.has(key)) {
          written.add(key)
          nextValues.forEach((entry) => params.push([key, entry]))
        }
      })
      next.forEach((nextValues, key) => {
        if (!written.has(key)) nextValues.forEach((entry) => params.push([key, entry]))
      })
      const query = new URLSearchParams(params).toString()
      const search = query ? `?${query}` : ""
      if (search !== history.location.search) history.replace({ ...history.location, search })
    },
    [history]
  )
  const setValue = useCallback(
    (id: string, value: readonly string[]) => write(new Map([[getUrlKey(id, urlPrefix), value]])),
    [write, urlPrefix]
  )

  const matches = useFilterMatches(entries, values)

  return {
    values,
    setValue,
    reset: () => write(new Map(ids.map((id) => [getUrlKey(id, urlPrefix), []]))),
    isFiltered: Object.keys(values).length > 0,
    matches,
  }
}

// For a table inside a form or a sheet: its filters must not outlive it in the page URL.
export function useLocalFilterState<T, K extends string>(
  filters: FilterFunctions<T, K>
): FilterState<T, K> {
  const entries = useFilterEntries(filters)
  const [values, setValues] = useState<FilterValues<K>>({})
  const setValue = useCallback((id: K, value: readonly string[]) => {
    const [first, ...rest] = value
    setValues((current) => {
      const next = { ...current }
      if (first == null) delete next[id]
      else next[id] = [first, ...rest]

      return next
    })
  }, [])
  const matches = useFilterMatches(entries, values)

  return {
    values,
    setValue,
    reset: () => setValues({}),
    isFiltered: Object.keys(values).length > 0,
    matches,
  }
}
