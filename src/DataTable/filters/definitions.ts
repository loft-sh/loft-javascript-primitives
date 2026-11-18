import { ComponentType } from "react"

import { getDateRangeString } from "../../DateRangePicker"
import type { FilterFn } from "./useFilterState"
import { str } from "@loft-enterprise/shared"

export type TableFilterIcon = ComponentType<{ className?: string }>

export type TableFilterOption = {
  value: string
  label: string
  description?: string
  Icon?: TableFilterIcon
}

export type FilterDefinition<T> = { filterFn?: FilterFn<T> } & (
  | { type: "text"; placeholder?: string }
  | {
      type: "options" | "select"
      label: string
      Icon?: TableFilterIcon
      options: TableFilterOption[]
    }
  | { type: "dateRange"; label: string; Icon?: TableFilterIcon }
)

export type FilterDefinitions<T, K extends string = string> = Partial<
  Record<K, FilterDefinition<T>>
>

export type ChipFilter<K extends string = string> = {
  id: K
  label: string
  Icon?: TableFilterIcon
} & ({ type: "dateRange" } | { type: "options" | "select"; options: TableFilterOption[] })

export function parseDateRange(
  value: readonly string[] | undefined
): { from: Date; to: Date } | undefined {
  if (value?.length !== 2) return undefined
  const [from, to] = value.map((entry) => new Date(entry))

  return from && to && from.getTime() <= to.getTime() ? { from, to } : undefined
}

export function compareOptions(a: TableFilterOption, b: TableFilterOption): number {
  return (
    a.label.localeCompare(b.label, undefined, { numeric: true }) ||
    str(a.description).localeCompare(str(b.description), undefined, { numeric: true })
  )
}

export function makeNameSearchFilters<T>(
  getNames: (row: T) => readonly (string | undefined)[],
  placeholder = "Filter by name or id..."
): FilterDefinitions<T, "search"> {
  return {
    search: {
      type: "text",
      placeholder,
      filterFn: (row, [query]) => {
        const needle = query.trimEnd().toLowerCase()

        return getNames(row).some((name) => str(name).toLowerCase().includes(needle))
      },
    },
  }
}

export function getChipLabel(chip: ChipFilter, value: readonly string[]): string {
  if (chip.type === "dateRange") return getDateRangeString(parseDateRange(value))

  return value
    .map((entry) => {
      const option = chip.options.find((candidate) => candidate.value === entry)
      if (!option) return entry

      return option.description ? `${option.label} (${option.description})` : option.label
    })
    .join(", ")
}
