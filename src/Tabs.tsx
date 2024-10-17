import * as TabsPrimitive from "@radix-ui/react-tabs"
import * as React from "react"

import { cn } from "../clsx/index"

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
      "group inline-flex h-9 items-center gap-4 rounded-lg p-1",
      {
        "[&_button]:text-sm [&_svg]:size-3": size === "small",
        "[&_button]:text-base [&_svg]:size-6": size === "large",
        "gap-1 [&_button]:!rounded-b-none [&_button]:!rounded-t-sm [&_button]:bg-body-main [&_button]:px-4 [&_button]:py-2":
          variant === "filled",
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
    variant?: "config-page" | "default"
  }
>(({ className, variant = "default", ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "border-0 bg-transparent",
      "inline-flex h-9 cursor-pointer items-center justify-center p-1 text-sm font-semibold text-secondary underline-offset-4 disabled:cursor-not-allowed disabled:text-disabled data-[state=active]:border-b-2 data-[state=active]:border-primary-main  data-[state=active]:text-primaryColor-main [&_svg]:size-4",
      "transition-colors group-data-[variant=filled]:data-[state=active]:bg-white",
      {
        "w-full justify-start self-start py-2 pl-0 font-medium text-primary data-[state=active]:rounded data-[state=active]:border-none data-[state=active]:bg-gray-20 data-[state=active]:pl-0 data-[state=active]:font-semibold data-[state=active]:text-primary":
          variant === "config-page",
      },
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "p-1 transition-opacity data-[state=active]:opacity-100 data-[state=inactive]:opacity-0",

      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
