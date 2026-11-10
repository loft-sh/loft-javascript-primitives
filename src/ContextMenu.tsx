import * as ContextMenuPrimitive from "@radix-ui/react-context-menu"
import * as React from "react"

import { cn } from "../cn-utils"
import { CommonSelectStyles } from "./Select/Common/type"

const ContextMenu = ContextMenuPrimitive.Root

const ContextMenuTrigger = ContextMenuPrimitive.Trigger

const ContextMenuContent = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Content>
>(({ className, ...props }, ref) => (
  <ContextMenuPrimitive.Portal>
    <ContextMenuPrimitive.Content
      ref={ref}
      className={cn(
        CommonSelectStyles.CONTENT_BASE,
        "z-top-level min-w-[8rem] overflow-hidden p-1",
        className
      )}
      {...props}
    />
  </ContextMenuPrimitive.Portal>
))
ContextMenuContent.displayName = ContextMenuPrimitive.Content.displayName

const ContextMenuItem = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Item> & {
    inset?: boolean
    danger?: boolean
  }
>(({ className, danger, ...props }, ref) => (
  <ContextMenuPrimitive.Item
    ref={ref}
    className={cn(
      CommonSelectStyles.ITEM,
      "flex-row gap-2 py-1 text-xs",
      {
        "cursor-not-allowed text-disabledColor-dark": props.disabled,
        "text-danger-main hover:bg-danger-light hover:text-danger-dark focus:bg-danger-light":
          danger,
      },
      className
    )}
    {...props}
  />
))
ContextMenuItem.displayName = ContextMenuPrimitive.Item.displayName

export { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger }
