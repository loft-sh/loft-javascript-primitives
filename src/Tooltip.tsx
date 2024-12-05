import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import * as React from "react"

import { cx } from "../clsx/index"
import { Button } from "./Button"

const TooltipProvider = TooltipPrimitive.Provider
const TooltipArrow = TooltipPrimitive.Arrow
const TooltipTrigger = TooltipPrimitive.Trigger
const TooltipRoot = TooltipPrimitive.Root
const TooltipPortal = TooltipPrimitive.Portal

type TTooltip = React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Root> & {
  content?: React.ReactNode
  wrappingTriggerDiv?: boolean
} & React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Trigger> &
  React.ComponentPropsWithoutRef<typeof TooltipContent>

const Tooltip = ({
  open,
  defaultOpen,
  children,
  side,
  align,
  onOk,
  onCancel,
  content,
  arrow = true,
  delayDuration = 300,
  onOpenChange,
  wrappingTriggerDiv = true,
  ...rest
}: TTooltip) => {
  return (
    <TooltipProvider delayDuration={delayDuration} {...rest}>
      <TooltipPrimitive.Root
        open={open}
        defaultOpen={defaultOpen}
        delayDuration={delayDuration}
        onOpenChange={onOpenChange}
        {...rest}>
        {/* asChild can only accept a single child https://github.com/radix-ui/primitives/issues/1979 */}
        <TooltipPrimitive.Trigger asChild>
          {/* We use this wrapping trigger div so we can pass multiple children to the tooltip without radix throwing an error */}
          {wrappingTriggerDiv ? <div>{children}</div> : children}
        </TooltipPrimitive.Trigger>
        {!!content && (
          <TooltipPortal container={document.getElementById("tooltip-portal")}>
            <TooltipContent
              side={side}
              align={align}
              onOk={onOk}
              onCancel={onCancel}
              arrow={arrow}
              {...rest}
              className={cx("max-w-sm", rest.className)}>
              {content}
            </TooltipContent>
          </TooltipPortal>
        )}
      </TooltipPrimitive.Root>
    </TooltipProvider>
  )
}

type TTooltipContent = React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> & {
  onOk?: () => void
  onCancel?: () => void
  okText?: string | React.ReactNode
  cancelText?: string | React.ReactNode
  arrow?: boolean
  richTooltip?: boolean
}

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  TTooltipContent
>(
  (
    {
      className,
      sideOffset = 4,
      children,
      onOk,
      onCancel,
      okText,
      cancelText,
      richTooltip,
      arrow,
      ...props
    },
    ref
  ) => {
    return (
      <TooltipPrimitive.Content
        data-tooltip-type={`${richTooltip ? "rich" : "default"}`}
        ref={ref}
        sideOffset={sideOffset}
        className={cx(
          "group z-50 flex animate-in flex-col gap-4 break-words rounded-md text-left shadow-small data-[state=closed]:animate-out",
          "data-[tooltip-type=rich]:bg-white data-[tooltip-type=rich]:text-sm data-[tooltip-type=rich]:text-primary data-[tooltip-type=rich]:shadow-small",
          "data-[tooltip-type=default]:bg-gray-90 data-[tooltip-type=default]:p-2 data-[tooltip-type=default]:text-xs data-[tooltip-type=default]:text-white",
          "[&_a]:data-[tooltip-type=default]:text-white [&_a]:data-[tooltip-type=default]:underline",
          className
        )}
        {...props}>
        {children}
        {(onCancel !== undefined || onOk !== undefined) && (
          <div className="flex justify-end space-x-2">
            {onCancel && (
              <Button
                className="self-end"
                onClick={onCancel}
                appearance="primary"
                variant="tertiary">
                {cancelText || "Cancel"}
              </Button>
            )}

            {onOk && (
              <Button className="self-end" onClick={onOk} appearance="primary">
                {okText || "Ok"}
              </Button>
            )}
          </div>
        )}

        {arrow && (
          <TooltipArrow
            className={cx(
              "group-data-[tooltip-type=default]:fill-gray-90 group-data-[tooltip-type=rich]:fill-white"
            )}
          />
        )}
      </TooltipPrimitive.Content>
    )
  }
)

TooltipContent.displayName = TooltipPrimitive.Content.displayName

export { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger, TooltipRoot, TooltipPortal }
