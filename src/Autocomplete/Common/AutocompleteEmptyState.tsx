import React from "react"

import { cn } from "../../../cn-utils"
import { InfoCircleOutlined } from "@loft-enterprise/icons"

export function AutocompleteEmptyState() {
  return (
    <div
      role="option"
      aria-disabled={true}
      className={cn(
        "box-border flex w-full select-none flex-row transition-colors",
        "items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none",
        "text-disabledColor-dark"
      )}>
      <InfoCircleOutlined className={"size-4 *:size-4"} aria-hidden={true} />
      No completions available.
    </div>
  )
}
