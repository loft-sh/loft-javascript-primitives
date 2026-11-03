import React from "react"

import { cn } from "../../cn-utils"
import { CollapsedBar } from "./CollapsedBar"
import { SplitPane, SplitPaneProps } from "./SplitPane"

type CollapseBarSlot = {
  label?: string
  Icon?: React.ComponentType<{ className?: string }>
}

type CollapsibleSplitPaneProps = SplitPaneProps & {
  collapsed?: "left" | "right" | undefined
  leftBar?: CollapseBarSlot
  rightBar?: CollapseBarSlot
  onExpandRequested?: () => void
}

export function CollapsibleSplitPane({
  collapsed,
  onExpandRequested,
  leftPane,
  rightPane,
  leftBar,
  rightBar,
  ...props
}: CollapsibleSplitPaneProps) {
  return (
    <SplitPane
      {...props}
      disableDrag={!!collapsed}
      gridClassName={cn({
        "grid-cols-[40px,1px,calc(100%-41px)]": collapsed === "left",
        "grid-cols-[calc(100%-41px),1px,40px]": collapsed === "right",
      })}
      leftPane={
        collapsed !== "left" ? (
          leftPane
        ) : (
          <CollapsedBar
            label={leftBar?.label}
            Icon={leftBar?.Icon}
            onClick={onExpandRequested}
            position="left"
          />
        )
      }
      rightPane={
        collapsed !== "right" ? (
          rightPane
        ) : (
          <CollapsedBar
            label={rightBar?.label}
            Icon={rightBar?.Icon}
            onClick={onExpandRequested}
            position="right"
          />
        )
      }
    />
  )
}
