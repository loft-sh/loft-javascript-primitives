import React, { useRef } from "react"

import { AutocompletePortal } from "./AutocompletePortal"
import { FlipContextProvider } from "./FlipContext"

export type AutocompleteAnchorProps = {
  children?: React.ReactNode
}

/**
 * Placeholder for an opened autocomplete that ensures the same space is still occupied on the page.
 * The content is portaled to the exact space where the autocomplete originally should be.
 */
export function AutocompleteAnchor({ children }: AutocompleteAnchorProps) {
  const placeholderRef = useRef<HTMLDivElement>(null)

  return (
    <div ref={placeholderRef} className={"relative h-[33px] w-full"}>
      <FlipContextProvider>
        <AutocompletePortal placeholderRef={placeholderRef}>{children}</AutocompletePortal>
      </FlipContextProvider>
    </div>
  )
}
