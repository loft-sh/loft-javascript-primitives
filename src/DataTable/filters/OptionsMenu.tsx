import React, { useMemo, useState } from "react"

import { Checkbox } from "../../Checkbox"
import { RadioGroup, RadioGroupItem } from "../../RadioGroup"
import { CommonSelectEmptyState } from "../../Select/Common/CommonSelectEmptyState"
import { CommonSelectSearchInput } from "../../Select/Common/CommonSelectSearchInput"
import { TableFilterOption } from "./definitions"
import { str } from "@loft-enterprise/shared"

export function OptionsMenu({
  value,
  onChange,
  onCloseRequested,
  options,
  label,
  single,
}: {
  value: readonly string[]
  onChange: (value: string[]) => void
  onCloseRequested: () => void
  options: TableFilterOption[]
  label: string
  single: boolean
}) {
  const [query, setQuery] = useState("")

  const visibleOptions = useMemo(() => {
    // A selected value with no rows left (or from a shared link) stays listed, so it can be cleared.
    const listed: TableFilterOption[] = [
      ...value
        .filter((entry) => !options.some((option) => option.value === entry))
        .map((entry) => ({ value: entry, label: entry })),
      ...options,
    ]
    const normalizedQuery = query.trim().toLowerCase()

    return normalizedQuery
      ? listed.filter((option) =>
          `${option.label} ${str(option.description)}`.toLowerCase().includes(normalizedQuery)
        )
      : listed
  }, [options, query, value])

  const rows = visibleOptions.map((option) => (
    <label
      key={option.value}
      className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-primary hover:bg-neutral-extra-light">
      {single ? (
        <RadioGroupItem value={option.value} />
      ) : (
        <Checkbox
          checked={value.includes(option.value)}
          onCheckedChange={(checked) =>
            onChange(
              checked === true
                ? [...value, option.value]
                : value.filter((entry) => entry !== option.value)
            )
          }
        />
      )}
      {option.Icon && <option.Icon className="size-4 shrink-0 *:size-4" />}
      <span className="truncate">{option.label}</span>
      {option.description && (
        <span className="truncate text-xs text-tertiary">{option.description}</span>
      )}
    </label>
  ))
  const emptyState = visibleOptions.length === 0 && <CommonSelectEmptyState variant="small" />

  return (
    <>
      <CommonSelectSearchInput
        autoFocus
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onEnterPressed={onCloseRequested}
        aria-label={`Search ${label.toLowerCase()} options`}
      />
      {single ? (
        <RadioGroup
          aria-label={`${label} options`}
          value={value[0]}
          onValueChange={(next) => onChange([next])}
          className="flex max-h-[250px] flex-col gap-0 overflow-y-auto">
          {rows}
          {emptyState}
        </RadioGroup>
      ) : (
        <div
          role="group"
          aria-label={`${label} options`}
          className="flex max-h-[250px] flex-col overflow-y-auto">
          {rows}
          {emptyState}
        </div>
      )}
    </>
  )
}
