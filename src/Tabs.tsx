import * as TabsPrimitive from "@radix-ui/react-tabs"
import * as React from "react"

import { cn } from "../clsx/index"
import { CloseOutlined } from "@loft-enterprise/icons"

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & {
    size?: "default" | "large" | "small"
    variant?: "ghost" | "filled"
  }
>(({ className, size = "default", variant = "ghost", ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    data-variant={variant}
    data-size={size}
    className={cn(
      "scrollbar-hide group inline-flex h-9 items-center gap-4 overflow-x-auto rounded-lg p-1",
      {
        "[&_button]:text-sm [&_svg]:size-3": size === "small",
        "[&_button]:text-base [&_svg]:size-6": size === "large",
        "w-full gap-0.5 rounded-b-none border-b border-divider-light pl-0": variant === "filled",
      },
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> & {
    variant?: "config-page" | "default" | "filled"
    closable?: boolean
    onClose?: () => void
  }
>(({ className, variant = "default", closable, onClose, children, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "relative text-nowrap border-0 bg-transparent",
      "inline-flex h-9 cursor-pointer items-center justify-center p-1 text-sm font-semibold text-secondary underline-offset-4 disabled:cursor-not-allowed disabled:text-disabled data-active:border-b-2 data-active:border-primary-main  data-active:text-primaryColor-main [&_svg]:size-4",
      "transition-colors group-data-[variant=filled]:data-active:bg-white",
      {
        "w-full justify-start self-start py-2 pl-0 font-medium text-primary data-active:rounded data-active:border-none data-active:bg-gray-20 data-active:pl-0 data-active:font-semibold data-active:text-primary":
          variant === "config-page",
      },
      {
        // filled variant
        "group-data-[variant=filled]:border-b-none mb-[-1px] data-[state=active]:z-10 group-data-[variant=filled]:rounded-t-lg group-data-[variant=filled]:border group-data-[variant=filled]:border-divider-light group-data-[variant=filled]:px-4 group-data-[variant=filled]:data-active:bg-white group-data-[variant=filled]:data-active:text-primaryColor-main group-data-[variant=filled]:data-inactive:bg-body-main group-data-[variant=filled]:data-inactive:text-secondary":
          true,
      },
      className
    )}
    {...props}>
    {children}
    {closable && (
      <button
        type="button"
        className="ml-2 flex size-4 items-center justify-center text-neutral-main transition-colors hover:text-neutral-dark"
        onClick={(e) => {
          e.stopPropagation()
          onClose?.()
        }}>
        <CloseOutlined className="*:size-5" />
      </button>
    )}
  </TabsPrimitive.Trigger>
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "p-1 transition-opacity data-[state=inactive]:opacity-0 data-active:flex-grow data-active:opacity-100",

      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
