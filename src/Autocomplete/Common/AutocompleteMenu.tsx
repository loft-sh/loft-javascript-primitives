import cn from "clsx"
import React, { useContext } from "react"

import { FlipContext } from "./FlipContext"

export type AutocompleteMenuProps = {
  children?: React.ReactNode
}

export function AutocompleteMenu({ children }: AutocompleteMenuProps) {
  const { flipped } = useContext(FlipContext)

  return (
    <div
      className={cn(
        "box-border flex max-h-48 w-full flex-col overflow-auto rounded-md bg-white text-sm [scrollbar-width:thin]",
        {
          "rounded-t-none": !flipped,
          "rounded-b-none": flipped,
        }
      )}>
      {children}
    </div>
  )
}
