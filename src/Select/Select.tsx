import CloseCircleFilled from "@ant-design/icons/CloseCircleFilled"
import * as SelectPrimitive from "@radix-ui/react-select"
import * as React from "react"

import { cn } from "../../cn-utils"
import { Tooltip } from "../Tooltip"
import { CommonSelectCaret } from "./Common/CommonSelectCaret"
import { CommonSelectEmptyState, SelectEmptyStateProps } from "./Common/CommonSelectEmptyState"
import { CommonSelectStyles, CommonSelectTriggerProps } from "./Common/type"
import { CloseOutlined } from "@loft-enterprise/icons"

const Select = SelectPrimitive.Root

const SelectGroup = SelectPrimitive.Group

const SelectValue = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Value>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Value> & {
    tooltip?: string
  }
>(({ className, children, tooltip, ...props }, ref) => {
  const titleText =
    tooltip ??
    (typeof children === "string"
      ? children
      : typeof props.placeholder === "string"
        ? props.placeholder
        : undefined)

  return (
    <SelectPrimitive.Value
      ref={ref}
      className={cn("cursor-pointer truncate after:[content:'detected']", className)}
      title={titleText}
      {...props}>
      {children}
    </SelectPrimitive.Value>
  )
})
SelectValue.displayName = SelectPrimitive.Trigger.displayName

type SelectTriggerProps = React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> &
  CommonSelectTriggerProps & {
    icon?: React.ElementType
    statusText?: string
    statusIcon?: React.ReactNode
  }

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  SelectTriggerProps & {
    onClearValue?: () => void
  }
>(
  (
    {
      className,
      children,
      inputSize = "default",
      icon: Icon,
      onClearValue,
      error,
      variant,
      statusText,
      statusIcon,
      ...props
    },
    forwardedRef
  ) => {
    const [titleText, setTitleText] = React.useState<string>("")

    const handleRef = React.useCallback(
      (node: HTMLButtonElement | null) => {
        if (node) {
          const text = node.innerText.trim() || ""
          setTitleText(text)
        }

        if (forwardedRef) {
          if (typeof forwardedRef === "function") {
            forwardedRef(node)
          } else {
            ;(forwardedRef as React.MutableRefObject<HTMLButtonElement | null>).current = node
          }
        }
      },
      [forwardedRef]
    )

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

      props.onPointerDown?.(e)
    }

    return (
      <SelectPrimitive.Trigger
        ref={handleRef}
        className={cn(
          "group/select-value",
          CommonSelectStyles.TRIGGER,
          {
            "h-8": inputSize === "default",
            "h-6": inputSize === "small",
            "h-10": inputSize === "large",
            "border-danger-main hover:border-danger-light focus:border-danger-main": error,
            "border-success-main hover:border-success-light focus:border-success-main":
              variant === "ready" && !error,
            "border-primary-main hover:border-primary-light focus:border-primary-main":
              variant === "loading" && !error,
          },
          className
        )}
        onPointerDown={handleTriggerPointerDown}
        title={titleText}
        {...props}>
        {children}
        <SelectPrimitive.Icon asChild>
          <div className="flex items-center gap-2">
            {onClearValue && (
              <CloseOutlined className="select-clear-button opacity-50" onClick={onClear} />
            )}
            {(error || statusIcon) && (
              <div className="-mr-2 flex items-center">
                {statusText ? (
                  <Tooltip delayDuration={0} content={statusText}>
                    {statusIcon || (
                      <CloseCircleFilled className="size-4 text-danger-main transition-colors hover:fill-danger-light" />
                    )}
                  </Tooltip>
                ) : (
                  statusIcon || (
                    <CloseCircleFilled className="size-4 text-danger-main transition-colors hover:fill-danger-light" />
                  )
                )}
              </div>
            )}
            <CommonSelectCaret icon={Icon} />
          </div>
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
    )
  }
)
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
            "z-top-level overflow-hidden",
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
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item> & {
    tooltip?: string
  }
>(({ className, children, tooltip, ...props }, ref) => {
  const titleText = tooltip ?? (typeof children === "string" ? children : undefined)

  return (
    <SelectPrimitive.Item
      ref={ref}
      className={cn(CommonSelectStyles.ITEM, className)}
      title={titleText}
      {...props}>
      <SelectPrimitive.ItemText className="truncate">{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
})
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
