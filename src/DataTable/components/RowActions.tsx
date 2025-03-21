import React, { ReactNode, useContext } from "react"

import { cn } from "../../../clsx"
import { Button } from "../../Button"
import { DataTableRowContext, TableRowContextOptions } from "../../DataTable/DataTableRowContext"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuPortal,
  DropdownMenuTrigger,
} from "../../DropdownMenu"
import { IconButton } from "../../IconButton"
import {
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
} from "../../Tooltip"
import { MoreOutlined } from "@loft-enterprise/icons"

interface ActionButtonProps {
  icon?: ReactNode
  children: ReactNode
  onClick?: () => void
  className?: string
}

export const ActionButton = ({ icon, children, onClick, className }: ActionButtonProps) => (
  <Button
    onClick={onClick}
    variant="outlined"
    appearance="neutral"
    className={cn(
      "bg-white font-bold text-primary transition-colors hover:text-primaryColor-main",
      className
    )}>
    {icon && <span className="mr-1">{icon}</span>}
    {children}
  </Button>
)

interface ActionsContainerProps {
  children: ReactNode
  className?: string
}

export const ActionsContainer = ({ children, className }: ActionsContainerProps) => {
  const rowContext = useContext(DataTableRowContext) as TableRowContextOptions

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={cn(
        "relative flex items-center justify-end gap-2 transition-opacity",
        {
          "opacity-30": rowContext.hoveredRow && rowContext.hoveredRow !== rowContext.rowId,
        },
        className
      )}>
      {children}
    </div>
  )
}

interface ActionDropdownProps {
  children: ReactNode
  trigger?: ReactNode
  tooltipLabel?: string
  align?: "start" | "center" | "end"
  side?: "top" | "right" | "bottom" | "left"
}

export const ActionDropdown = ({
  children,
  trigger,
  tooltipLabel = "More",
  align = "end",
  side = "bottom",
}: ActionDropdownProps) => (
  <TooltipProvider delayDuration={200}>
    <DropdownMenu>
      <TooltipRoot>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            {trigger || (
              <IconButton
                appearance="ghost"
                className="p-1.5 text-primary"
                aria-label={tooltipLabel}>
                <MoreOutlined className="*:size-5" />
              </IconButton>
            )}
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipPortal>
          <TooltipContent>
            <span>{tooltipLabel}</span>
          </TooltipContent>
        </TooltipPortal>
        <DropdownMenuPortal>
          <DropdownMenuContent sticky="always" side={side} align={align}>
            <div className="*:px-4 *:py-2">{children}</div>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </TooltipRoot>
    </DropdownMenu>
  </TooltipProvider>
)
