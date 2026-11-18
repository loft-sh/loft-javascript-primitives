import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import React from "react"

import { cn } from "../../../cn-utils"
import { Button } from "../../Button"
import { IconButton } from "../../IconButton"
import { Input } from "../../Input"
import { FilterDefinitions } from "./definitions"
import { FilterCategoryMenu } from "./FilterCategoryMenu"
import { FilterChip } from "./FilterChip"
import { ChipFilterBar } from "./useChipFilterBar"
import { FilterState } from "./useFilterState"
import { FilterOutlined, PlusOutlined, SearchOutlined } from "@loft-enterprise/icons"
import { arrStrict, str } from "@loft-enterprise/shared"

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1]

type ChipBarProps<K extends string> = { chipBar: ChipFilterBar<K>; disabled?: boolean }

export function FilterSearch<T, K extends string>({
  filters,
  filterState,
  disabled,
}: {
  filters: FilterDefinitions<T, K>
  filterState: Pick<FilterState<T, K>, "values" | "setValue">
  disabled?: boolean
}) {
  for (const id in filters) {
    const filter = filters[id]
    if (filter?.type === "text") {
      const placeholder = filter.placeholder ?? "Search..."

      return (
        <Input
          aria-label={placeholder}
          className="w-[280px]"
          preffix={<SearchOutlined />}
          disabled={disabled}
          placeholder={placeholder}
          value={str(filterState.values[id]?.[0])}
          onChange={(event) =>
            filterState.setValue(id, event.target.value ? [event.target.value] : [])
          }
        />
      )
    }
  }

  return null
}

export function FilterMenu<K extends string>({ chipBar, disabled }: ChipBarProps<K>) {
  // No chip and nothing to add: hide. Every filter already in use: disable.
  if (chipBar.chips.length === 0 && chipBar.addable.length === 0) return null

  return (
    <FilterCategoryMenu
      filters={chipBar.addable}
      onSelectRequested={chipBar.add}
      onDismissRequested={chipBar.dismissAdd}>
      <Button
        variant="ghost"
        appearance="neutral"
        disabled={disabled || chipBar.addable.length === 0}>
        <FilterOutlined /> Filters
      </Button>
    </FilterCategoryMenu>
  )
}

export function FilterChips<K extends string>({ chipBar, disabled }: ChipBarProps<K>) {
  const reducedMotion = useReducedMotion()
  const canAdd = chipBar.addable.length > 0

  return (
    <AnimatePresence initial={false}>
      {chipBar.chips.length > 0 && (
        <motion.div
          className="overflow-hidden"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{
            height: 0,
            opacity: 0,
            transition: reducedMotion
              ? { duration: 0 }
              : { height: { duration: 0.14, ease: EASE_OUT }, opacity: { duration: 0.1 } },
          }}
          transition={
            reducedMotion
              ? { duration: 0 }
              : { height: { duration: 0.18, ease: EASE_OUT }, opacity: { duration: 0.12 } }
          }>
          <div
            className={cn(
              "mt-4 flex items-center rounded border border-divider-main bg-body-main p-3",
              { "opacity-60": disabled }
            )}>
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
              {chipBar.chips.map((chip) => (
                <FilterChip
                  key={chip.id}
                  chip={chip}
                  disabled={disabled}
                  value={arrStrict(chipBar.values[chip.id])}
                  open={chip.id === chipBar.openId}
                  onChange={(value) => chipBar.setValue(chip.id, value)}
                  onOpenRequested={() => chipBar.open(chip.id)}
                  onCloseRequested={() => chipBar.closeChip(chip.id)}
                  onHideRequested={chipBar.hide}
                  onRemoveRequested={() => chipBar.removeChip(chip.id)}
                />
              ))}
              {canAdd && (
                <FilterCategoryMenu
                  filters={chipBar.addable}
                  onSelectRequested={chipBar.add}
                  onDismissRequested={chipBar.dismissAdd}>
                  <IconButton
                    disabled={disabled}
                    appearance="ghost"
                    className="hocus:bg-neutral-light"
                    size="small"
                    aria-label="Add filter">
                    <PlusOutlined />
                  </IconButton>
                </FilterCategoryMenu>
              )}
            </div>
            <Button
              disabled={disabled}
              variant="ghost"
              appearance="neutral"
              size="small"
              className="shrink-0 px-0"
              onClick={chipBar.clearChips}>
              Clear
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
