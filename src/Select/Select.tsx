import * as SelectPrimitive from "@radix-ui/react-select"
import * as React from "react"

import { cn } from "../../clsx"
import { CommonSelectCaret } from "./Common/CommonSelectCaret"
import { CommonSelectEmptyState, SelectEmptyStateProps } from "./Common/CommonSelectEmptyState"
import { CommonSelectStyles, CommonSelectTriggerProps } from "./Common/type"
import { CloseOutlined } from "@loft-enterprise/icons"

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

type SelectTriggerProps = React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> &
  CommonSelectTriggerProps & {
    icon?: React.ElementType
  }

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  SelectTriggerProps & {
    onClearValue?: () => void
  }
>(({ className, children, inputSize = "default", icon: Icon, onClearValue, ...props }, ref) => {
  const onClear = React.useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      e.preventDefault()
      onClearValue?.()
    },
    [onClearValue]
  )

  const handleTriggerPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    const target = e.target as HTMLElement
    if (target.closest(".select-clear-button")) {
      e.preventDefault()
      e.stopPropagation()

      return
    }

    // We still keep this in case we pass it from the parent for whatever reason.
    props.onPointerDown?.(e)
  }

  return (
    <SelectPrimitive.Trigger
      ref={ref}
      className={cn(
        CommonSelectStyles.TRIGGER,
        {
          "h-8": inputSize === "default",
          "h-6": inputSize === "small",
          "h-10": inputSize === "large",
        },
        className
      )}
      onPointerDown={handleTriggerPointerDown}
      {...props}>
      {children}
      <SelectPrimitive.Icon asChild>
        <div className="flex items-center gap-2">
          {onClearValue && (
            <CloseOutlined className="select-clear-button opacity-50" onClick={onClear} />
          )}
          <CommonSelectCaret icon={Icon} />
        </div>
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
})
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> & {
    emptyStateProps?: SelectEmptyStateProps
    viewPortClassName?: string
  }
>(
  (
    {
      className,
      viewPortClassName,
      children,
      position = "popper",
      emptyStateProps,

      ...props
    },
    ref
  ) => {
    const hasChildren = !!(children && (!Array.isArray(children) || children.length))

    return (
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          ref={ref}
          className={cn(
            CommonSelectStyles.CONTENT,
            "overflow-hidden",
            position === "popper" && CommonSelectStyles.CONTENT_POPPER,
            className
          )}
          position={position}
          sideOffset={-3}
          {...props}>
          <SelectPrimitive.Viewport
            className={cn(
              "p-1",
              position === "popper" &&
                "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]",
              viewPortClassName
            )}>
            {!hasChildren && <CommonSelectEmptyState {...emptyStateProps} />}
            <div className="flex flex-col">{children}</div>
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    )
  }
)
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("border-x-0 border-b border-t-0 border-divider-light p-2 text-sm", className)}
    {...props}
  />
))
SelectLabel.displayName = SelectPrimitive.Label.displayName

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item ref={ref} className={cn(CommonSelectStyles.ITEM, className)} {...props}>
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
