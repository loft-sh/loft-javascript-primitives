import React from "react"

import { cn } from "../../cn-utils"
import { Button } from "../Button"
import { LeftOutlined, RightOutlined } from "@loft-enterprise/icons"

type TCollapsedBarProps = {
  label?: string
  icon?: React.ReactNode
  onClick?: () => void
  position: "left" | "right"
}

export const CollapsedBar: React.FC<TCollapsedBarProps> = ({ label, icon, onClick, position }) => {
  return (
    <div
      className={cn("bg-neutral-background flex h-full w-10 flex-col items-center justify-center")}>
      <Button
        variant="ghost"
        appearance="neutral"
        onClick={onClick}
        className="hover:bg-neutral-hover h-full w-full justify-center rounded-none border-0 p-0 pt-0 text-sm"
        aria-label={`Expand${label ? ` ${label}` : ""}`}>
        <div className="flex h-full flex-col items-center justify-start gap-1 pt-2">
          <span className="flex-shrink-0">
            {position === "right" ? (
              <LeftOutlined className={"size-4 *:size-4"} />
            ) : (
              <RightOutlined className={"size-4 *:size-4"} />
            )}
          </span>
          {icon && <span className="flex-shrink-0">{icon}</span>}
          {label && (
            <span
              style={{ writingMode: "vertical-rl" }}
              className="flex-shrink-0 whitespace-nowrap">
              {label}
            </span>
          )}
        </div>
      </Button>
    </div>
  )
}
