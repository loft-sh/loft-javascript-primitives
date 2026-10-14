import * as React from "react"
import { forwardRef, memo, useEffect, useRef, useState } from "react"

import { cn } from "../../cn-utils"
import { Tooltip } from "../Tooltip"
import { CloseOutlined } from "@loft-enterprise/icons"

type RemovableValueChipProps = {
  label: React.ReactNode
  onRemoveRequested?: (e: React.MouseEvent<HTMLElement | SVGSVGElement>) => void
  className?: string
  showTooltips?: boolean
  preventRemove?: boolean
}

export const RemovableValueChip = memo(
  forwardRef<HTMLDivElement, RemovableValueChipProps>(function InnerRemovableValueChip(
    { label, onRemoveRequested, className, showTooltips, preventRemove },
    ref
  ) {
    const spanRef = useRef<HTMLSpanElement>(null)
    const [renderTooltip, setRenderTooltip] = useState(false)

    useEffect(() => {
      const element = spanRef.current

      if (!element || !showTooltips) {
        return
      }

      const calculateTooltipVisibility = () => {
        const rect = element.getBoundingClientRect()
        const actualWidth = Math.ceil(rect.width)
        const scrollWidth = element.scrollWidth
        setRenderTooltip(scrollWidth > actualWidth)
      }

      calculateTooltipVisibility()

      const resizeObserver = new ResizeObserver(calculateTooltipVisibility)

      resizeObserver.observe(element)

      return () => {
        resizeObserver.disconnect()
      }
    }, [showTooltips])

    const tooltipContent = typeof label === "string" && renderTooltip ? label : undefined

    return (
      <div
        ref={ref}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "box-border flex w-fit flex-row items-center gap-1 truncate border border-neutral-main px-1.5 py-0.5",
          "rounded-md text-sm text-primary [&_*]:!text-primary [&_svg]:!size-3",
          "box-border cursor-default overflow-hidden",
          className
        )}>
        <Tooltip wrappingTriggerDiv={false} content={tooltipContent}>
          <span
            ref={spanRef}
            className={"select-none truncate whitespace-nowrap [line-height:17px]"}>
            {label}
          </span>
        </Tooltip>
        <CloseOutlined
          className={cn("ml-1 h-3 w-3 flex-shrink-0 cursor-pointer text-secondary", {
            "pointer-events-none": preventRemove,
          })}
          role="button"
          aria-label={typeof label === "string" ? `Remove ${label}` : "Remove"}
          aria-disabled={preventRemove ? true : undefined}
          onClick={(e) => {
            e.stopPropagation()
            onRemoveRequested?.(e)
          }}
        />
      </div>
    )
  })
)
