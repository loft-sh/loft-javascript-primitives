import DownOutlined from "@ant-design/icons/DownOutlined"
import * as SelectPrimitive from "@radix-ui/react-select"
import * as React from "react"

import { cn } from "../clsx"

const Select = SelectPrimitive.Root

const SelectGroup = SelectPrimitive.Group

const SelectValue = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Value>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Value>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Value
    ref={ref}
    className={cn("cursor-pointer after:[content:'detected']", className)}
    {...props}>
    {children}
  </SelectPrimitive.Value>
))
SelectValue.displayName = SelectPrimitive.Trigger.displayName

type SelectTriggerProps = React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> & {
  inputSize?: "default" | "small" | "large"
  icon?: React.ElementType
}

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  SelectTriggerProps
>(({ className, children, inputSize = "default", icon: Icon, ...props }, ref) => {
  const UsedIcon = Icon ?? DownOutlined

  return (
    <SelectPrimitive.Trigger
      ref={ref}
      className={cn(
        "ring-offset-background placeholder:text-muted-foreground focus:ring-ring shadow-sm group flex w-full items-center justify-between whitespace-nowrap rounded-md border   border-divider-main bg-transparent px-3 py-2 text-sm outline-none transition-all hover:cursor-pointer hover:border-primary-main focus:border-primary-main disabled:cursor-not-allowed disabled:opacity-50 data-[state=open]:text-disabledColor-dark [&>span]:line-clamp-1",
        {
          "h-8": inputSize === "default",
          "h-6": inputSize === "small",
          "h-10": inputSize === "large",
        },
        className
      )}
      {...props}>
      {children}
      <SelectPrimitive.Icon asChild>
        <UsedIcon className="opacity-50 transition-transform *:size-4 group-aria-[expanded=true]:rotate-180" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
})
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-[1100] max-h-96 overflow-hidden rounded-md border bg-white text-primary shadow-md data-[side=bottom]:animate-slide-in-top data-[side=left]:animate-slide-in-right data-[side=right]:animate-slide-in-left data-[side=top]:animate-slide-in-bottom data-[state=closed]:animate-out data-[state=open]:animate-in",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      )}
      position={position}
      sideOffset={-3}
      {...props}>
      <SelectPrimitive.Viewport
        className={cn(
          "p-1",
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
        )}>
        {children}
      </SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("border-x-0 border-b border-t-0   border-divider-light p-2 text-sm", className)}
    {...props}
  />
))
SelectLabel.displayName = SelectPrimitive.Label.displayName

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative box-border flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none transition-colors hover:bg-neutral-extra-light data-[disabled]:pointer-events-none data-[state=checked]:bg-neutral-light/50 data-[state=checked]:text-secondary data-[disabled]:opacity-50",
      className
    )}
    {...props}>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 h-px bg-divider-light", className)}
    {...props}
  />
))
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
}
