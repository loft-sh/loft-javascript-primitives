import * as PopoverPrimitive from "@radix-ui/react-popover"
import * as React from "react"

import { cx } from "../clsx/index"
import { Button } from "./Button"

const PopoverArrow = PopoverPrimitive.Arrow
const PopoverTrigger = PopoverPrimitive.Trigger
const PopoverPortal = PopoverPrimitive.Portal

type TPopover = React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Root> & {
  content: React.ReactNode
} & React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Trigger> &
  React.ComponentPropsWithoutRef<typeof PopoverContent>

const PopoverRoot = PopoverPrimitive.Root

const Popover = ({
  open,
  defaultOpen,
  children,
  side,
  align,
  onOk,
  onCancel,
  content,
  ...rest
}: TPopover) => {
  return (
    <PopoverPrimitive.Root open={open} defaultOpen={defaultOpen} {...rest}>
      <PopoverPrimitive.Trigger asChild>{children}</PopoverPrimitive.Trigger>
      <PopoverContent side={side} align={align} onOk={onOk} onCancel={onCancel} {...rest}>
        {content}
      </PopoverContent>
    </PopoverPrimitive.Root>
  )
}

type TPopoverContent = React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> & {
  onOk?: () => void
  onCancel?: () => void
  okText?: string | React.ReactNode
  cancelText?: string | React.ReactNode
  arrow?: boolean
}

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  TPopoverContent
>(
  (
    {
      className,
      align = "center",
      sideOffset = 4,
      onOk,
      onCancel,
      okText,
      cancelText,
      children,
      ...props
    },
    ref
  ) => (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        className={cx(
          "z-50 flex animate-in flex-col break-words rounded-sm bg-white text-sm text-primary shadow-small data-[state=closed]:animate-out",
          className
        )}
        {...props}>
        {children}
        <div className="flex justify-end space-x-2">
          {onCancel && (
            <Button className="self-end" onClick={onCancel} appearance="primary" variant="tertiary">
              {cancelText || "Cancel"}
            </Button>
          )}

          {onOk && (
            <Button className="self-end" onClick={onOk} appearance="primary">
              {okText || "Ok"}
            </Button>
          )}
        </div>
        {props.arrow && <PopoverArrow className="fill-white" />}
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  )
)
PopoverContent.displayName = PopoverPrimitive.Content.displayName

export { Popover, PopoverContent, PopoverRoot, PopoverTrigger, PopoverPortal }
