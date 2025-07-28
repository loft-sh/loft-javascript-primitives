import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"
import React, { useCallback, useEffect, useState } from "react"

import { CollapseIcon, DownOutlined, ExpandIcon, RightOutlined } from "@loft-enterprise/icons"
import { cn, IconButton, Tooltip } from "@loft-enterprise/primitives"

export enum ExpansionAreaVariant {
  FLAT = "FLAT",
  OUTLINE = "OUTLINE",
  GHOST = "GHOST",
}

export type CollapseAction = {
  icon: React.ReactNode
  tooltip: string
  disabled?: boolean
  onClick?: (e: React.MouseEvent<HTMLElement>) => unknown
}

type BaseProps = {
  children?: React.ReactNode
  className?: string
  triggerClassName?: string
  contentClassName?: string
  iconClassName?: string
  title: string | React.ReactNode
  description?: string | React.ReactNode
  defaultOpen?: boolean
  disabled?: boolean
  triggerBeforeChildren?: React.ReactNode
  triggerAfterChildren?: React.ReactNode
  triggerRef?: React.RefObject<HTMLButtonElement>
  id?: string
  onOpenChange?: (open: boolean) => void
}

type GhostVariantProps = BaseProps & {
  variant: ExpansionAreaVariant.GHOST
  primaryAction?: CollapseAction
}

type BoxedProps = BaseProps & {
  variant?: ExpansionAreaVariant.FLAT | ExpansionAreaVariant.OUTLINE
  primaryAction?: never
}

export type ExpansionAreaProps = GhostVariantProps | BoxedProps

const ExpansionArea = React.forwardRef<HTMLDivElement, ExpansionAreaProps>(
  (
    {
      children,
      title,
      className,
      triggerClassName,
      contentClassName,
      iconClassName,
      description,
      defaultOpen = false,
      variant = ExpansionAreaVariant.FLAT,
      primaryAction,
      triggerBeforeChildren,
      triggerAfterChildren,
      triggerRef,
      id,
      disabled,
      onOpenChange,
    },
    ref
  ) => {
    const [_open, setOpen] = useState<boolean>(defaultOpen)

    const open = disabled ? false : _open

    const isBoxed =
      variant === ExpansionAreaVariant.FLAT || variant === ExpansionAreaVariant.OUTLINE

    const primaryActionClick = useCallback(
      (e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation()
        primaryAction?.onClick?.(e)
      },
      [primaryAction]
    )

    useEffect(() => {
      if (disabled) {
        setOpen(false)
      }
    }, [disabled])

    const handleOpenChange = useCallback(
      (open: boolean) => {
        if (disabled) {
          return
        }
        setOpen(open)
        onOpenChange?.(open)
      },
      [onOpenChange, disabled]
    )

    return (
      <CollapsiblePrimitive.Root
        ref={ref}
        id={id}
        open={open}
        onOpenChange={handleOpenChange}
        className={cn(
          "flex w-full flex-col",
          {
            "rounded-md border border-divider-light": isBoxed,
            "bg-gray-5": variant === ExpansionAreaVariant.FLAT,
            "bg-transparent": variant === ExpansionAreaVariant.OUTLINE,
          },
          className
        )}
        defaultOpen={open ? open : undefined}>
        <CollapsiblePrimitive.Trigger
          ref={triggerRef}
          className={cn(
            "box-border flex w-full flex-row text-primary",
            {
              "p-2": isBoxed,
              "cursor-auto": disabled,
            },
            triggerClassName
          )}>
          <div
            className={cn("flex w-full flex-row items-center", {
              "gap-2": isBoxed,
              "gap-1": !isBoxed,
            })}>
            {triggerBeforeChildren && triggerBeforeChildren}
            {!isBoxed ? (
              <div
                className={cn("flex size-8 flex-col items-center justify-center", iconClassName)}>
                {open ? <DownOutlined /> : <RightOutlined />}
              </div>
            ) : undefined}
            <div className={"flex flex-col"}>
              <div
                className={cn("text-sm font-medium text-primary", {
                  "text-disabledColor-dark": disabled,
                })}>
                {title}
              </div>
              {description && (
                <div className="text-xs font-medium text-tertiary">{description}</div>
              )}
            </div>
            {triggerAfterChildren && triggerAfterChildren}
            {isBoxed ? (
              <div
                className={cn(
                  "ml-auto flex size-8 flex-col items-center justify-center",
                  { "text-disabledColor-main": disabled },
                  iconClassName
                )}>
                {open ? <CollapseIcon /> : <ExpandIcon />}
              </div>
            ) : primaryAction ? (
              <div className={"ml-auto flex size-8 flex-col items-center justify-center"}>
                <Tooltip className={"z-top-level"} content={primaryAction.tooltip}>
                  <IconButton
                    appearance="ghost"
                    onClick={primaryActionClick}
                    disabled={primaryAction.disabled}>
                    {primaryAction.icon}
                  </IconButton>
                </Tooltip>
              </div>
            ) : undefined}
          </div>
        </CollapsiblePrimitive.Trigger>
        <CollapsiblePrimitive.Content
          className={cn({ "p-2": isBoxed, "ml-8 mt-4": !isBoxed }, contentClassName)}>
          {children}
        </CollapsiblePrimitive.Content>
      </CollapsiblePrimitive.Root>
    )
  }
)

ExpansionArea.displayName = "ExpansionArea"

export { ExpansionArea }
