import React, { ReactNode, useRef } from "react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../DropdownMenu"
import { ChipFilter } from "./definitions"

export function FilterCategoryMenu<K extends string>({
  filters,
  onSelectRequested,
  onDismissRequested,
  children,
}: {
  filters: ChipFilter<K>[]
  onSelectRequested: (id: K) => void
  onDismissRequested: () => void
  children: ReactNode
}) {
  const selectedIdRef = useRef<K | null>(null)

  // FilterChip keeps an open empty chip when a click lands here: the user switches category.
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild data-filter-category-menu="">
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        data-filter-category-menu=""
        align="start"
        sideOffset={4}
        className="z-top-level w-[220px] shadow-xl data-[state=closed]:duration-0"
        onCloseAutoFocus={(event) => {
          const id = selectedIdRef.current
          if (id === null) {
            onDismissRequested()

            return
          }
          selectedIdRef.current = null
          event.preventDefault()
          onSelectRequested(id)
        }}>
        {filters.map((filter) => (
          <DropdownMenuItem
            key={filter.id}
            className="gap-2 [&_svg]:mr-0"
            onSelect={() => {
              selectedIdRef.current = filter.id
            }}>
            {filter.Icon && <filter.Icon className="size-4 shrink-0 *:size-4" />}
            {filter.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
