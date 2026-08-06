import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import React, { ForwardedRef, forwardRef } from "react"

import { cn } from "../cn-utils"
import { Button, ButtonStyles } from "./Button"

type Side = "top" | "right" | "bottom" | "left"

export type RichTooltipAction = {
  label: string
  Icon?: React.ComponentType<{ className?: string }>
  style?: ButtonStyles
  disabled?: boolean
  onClick?: (e: React.MouseEvent<HTMLElement>) => any
}

type StandardTooltipActions = {
  primaryAction?: RichTooltipAction
  secondaryAction?: RichTooltipAction
  tertiaryAction?: RichTooltipAction
}

export type RichTooltipProps = {
  className?: string
  content: React.ReactNode
  children: React.ReactNode
  title?: React.ReactNode
  side?: Side
} & StandardTooltipActions

function InnerRichTooltipBox(
  { children, className, side }: { children?: React.ReactNode; className?: string; side?: Side },
  ref: ForwardedRef<HTMLDivElement>
) {
  return (
    <TooltipPrimitive.Content
      ref={ref}
      side={side}
      className={cn(
        "z-top-level box-border rounded-md bg-white p-4 text-sm text-primary shadow-small outline-none",
        className
      )}>
      {children}
    </TooltipPrimitive.Content>
  )
}

const RichTooltipBox = forwardRef(InnerRichTooltipBox)

function RichTooltipActions({ children }: { children?: React.ReactNode }) {
  return <div className={"mt-2 flex w-full flex-row items-center"}>{children}</div>
}

function RichTooltipTitle({ children }: { children?: React.ReactNode }) {
  return (
    <div className={"mb-2 flex w-full flex-row items-center text-sm font-semibold text-primary"}>
      {children}
    </div>
  )
}

function RichTooltipDefaultActions({
  primaryAction,
  secondaryAction,
  tertiaryAction,
}: StandardTooltipActions) {
  return (
    <>
      <div className={"ml-auto flex flex-row items-center gap-2"}>
        {tertiaryAction && (
          <Button
            {...(tertiaryAction.style ?? { variant: "outlined" })}
            disabled={tertiaryAction.disabled}
            onClickAsync={tertiaryAction.onClick}>
            {tertiaryAction.Icon && <tertiaryAction.Icon />} {tertiaryAction.label}
          </Button>
        )}
        {secondaryAction && (
          <Button
            {...(secondaryAction.style ?? { variant: "outlined" })}
            disabled={secondaryAction.disabled}
            onClickAsync={secondaryAction.onClick}>
            {secondaryAction.Icon && <secondaryAction.Icon />} {secondaryAction.label}
          </Button>
        )}
        {primaryAction && (
          <Button
            {...primaryAction.style}
            disabled={primaryAction.disabled}
            onClickAsync={primaryAction.onClick}>
            {primaryAction.Icon && <primaryAction.Icon />} {primaryAction.label}
          </Button>
        )}
      </div>
    </>
  )
}

export function RichTooltip({
  content,
  children,
  className,
  side,
  title,
  primaryAction,
  secondaryAction,
  tertiaryAction,
}: RichTooltipProps) {
  const hasActions = !!(primaryAction ?? secondaryAction ?? tertiaryAction)

  if (!content) {
    return <>{children}</>
  }

  return (
    <TooltipPrimitive.TooltipProvider delayDuration={0}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <RichTooltipBox side={side} className={className}>
            {title && <RichTooltipTitle>{title}</RichTooltipTitle>}
            {content}
            {hasActions && (
              <RichTooltipActions>
                <RichTooltipDefaultActions
                  primaryAction={primaryAction}
                  secondaryAction={secondaryAction}
                  tertiaryAction={tertiaryAction}
                />
              </RichTooltipActions>
            )}
            <TooltipPrimitive.Arrow className="fill-white" />
          </RichTooltipBox>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.TooltipProvider>
  )
}
