import * as DialogPrimitive from "@radix-ui/react-dialog"
import React, {
  CSSProperties,
  ForwardedRef,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react"

import cn from "../clsx"
import { Button, ButtonStyles } from "./Button"
import { WarningOutlined } from "@loft-enterprise/icons"

export type ModalAction = {
  label: string
  icon?: React.ReactNode
  style?: ButtonStyles
  disabled?: boolean
  onClick?: (e: React.MouseEvent<HTMLElement>) => unknown
}

// Usually has the same label ("Cancel"), so `label` is optional here.
export type SecondaryModalAction = Partial<Pick<ModalAction, "label">> & Omit<ModalAction, "label">

type StandardModalActions = {
  // Button displayed on the right. (e.g. "Save changes")
  primaryAction?: ModalAction

  // Button displayed on the right, left of the primary action. (e.g. "Cancel")
  secondaryAction?: SecondaryModalAction

  // Button displayed on the left, should be used primarily for auxiliary, destructive actions. (e.g. "Delete")
  leftAction?: ModalAction
}

type BaseModalProps = {
  // Styles the outer modal box.
  className?: string

  // Fixed CSS size for the outer modal box
  fixedWidth?: string

  // If set, lets the parent component control whether this modal is visible or not.
  open?: boolean

  // Defines the initial open state of the modal.
  defaultOpen?: boolean

  // If `open` is set, this will propagate changes requested to the status by the modal itself,
  // e.g. clicking outside the modal to close it.
  onOpenChangeRequested?: (open: boolean) => void

  // Triggers when the visibility of the modal changes to visible.
  onShow?: () => void

  // Triggers when the visibility of the modal changes to hidden.
  onHide?: () => void

  // Contents of the modal body.
  children?: React.ReactNode

  // Contents of the modal title. Might have an icon prepended to it if `warning` is set.
  title?: React.ReactNode

  // Adds a warning icon to the title, as this is a common use case.
  warning?: boolean
}

type ModalPropsWithCustomActions = BaseModalProps & {
  // Overrides the standard actions giving complete freedom for the last section.
  customActions?: React.ReactNode

  // Disallow standard actions when we have custom actions.
  primaryAction?: never
  secondaryAction?: never
  leftAction?: never
}

type ModalPropsWithStandardActions = BaseModalProps &
  StandardModalActions & {
    // Disallow standard actions when we have custom actions.
    customActions?: never
  }

export type ModalProps = ModalPropsWithCustomActions | ModalPropsWithStandardActions

export type ModalDialogInstance = {
  show(): void
  hide(): void
}

function InnerModalMask(
  { children }: { children?: React.ReactNode },
  ref: ForwardedRef<HTMLDivElement>
) {
  return (
    <DialogPrimitive.DialogOverlay
      ref={ref}
      className={cn(
        "fixed left-0 top-0 z-top-level flex flex-col items-center justify-center",
        "h-[100vh] w-[100vw] animate-in-linear bg-[rgba(0,0,0,0.45)]"
      )}>
      {children}
    </DialogPrimitive.DialogOverlay>
  )
}

const ModalMask = forwardRef(InnerModalMask)

function InnerModalBox(
  {
    children,
    className,
    style,
  }: { children?: React.ReactNode; className?: string; style?: CSSProperties },
  ref: ForwardedRef<HTMLDivElement>
) {
  return (
    <DialogPrimitive.Content
      ref={ref}
      style={style}
      aria-describedby={undefined}
      className={cn("rounded-lg bg-white shadow-small outline-none", className)}>
      {children}
    </DialogPrimitive.Content>
  )
}

const ModalBox = forwardRef(InnerModalBox)

function InnerModalTitle(
  { children }: { children?: React.ReactNode },
  ref: ForwardedRef<HTMLHeadingElement>
) {
  return (
    <DialogPrimitive.DialogTitle
      ref={ref}
      className={"mb-0 flex w-full flex-row px-6 pb-4 pt-6 text-lg font-semibold text-primary"}>
      {children}
    </DialogPrimitive.DialogTitle>
  )
}

const ModalTitle = forwardRef(InnerModalTitle)

function ModalBody({ children }: { children?: React.ReactNode }) {
  return (
    <div className={"flex w-full flex-col px-6 py-2 text-sm font-normal text-primary"}>
      {children}
    </div>
  )
}

function ModalActions({ children }: { children?: React.ReactNode }) {
  return <div className={"flex w-full flex-row items-center px-6 py-4"}>{children}</div>
}

function ModalDefaultActions({ primaryAction, secondaryAction, leftAction }: StandardModalActions) {
  return (
    <>
      {leftAction && (
        <Button
          {...leftAction.style}
          disabled={leftAction.disabled}
          onClickAsync={leftAction.onClick}>
          {leftAction.icon} {leftAction.label}
        </Button>
      )}
      <div className={"ml-auto flex flex-row items-center gap-2"}>
        {secondaryAction && (
          <Button
            {...(secondaryAction.style ?? { variant: "outlined" })}
            disabled={secondaryAction.disabled}
            onClickAsync={secondaryAction.onClick}>
            {secondaryAction.icon} {secondaryAction.label ?? "Cancel"}
          </Button>
        )}
        {primaryAction && (
          <Button
            {...primaryAction.style}
            disabled={primaryAction.disabled}
            onClickAsync={primaryAction.onClick}>
            {primaryAction.icon} {primaryAction.label}
          </Button>
        )}
      </div>
    </>
  )
}

const InnerModalDialog = (
  {
    fixedWidth,
    primaryAction,
    secondaryAction,
    leftAction,
    className,
    customActions,
    open,
    children,
    title,
    warning,
    onShow,
    onHide,
    onOpenChangeRequested,
    defaultOpen,
  }: ModalProps,
  ref: ForwardedRef<ModalDialogInstance>
) => {
  const [visible, setVisible] = useState(!!defaultOpen)

  const controlled = open !== undefined

  const changeVisible = useCallback(
    (v: boolean) => {
      const changed = visible !== v

      if (changed && v) {
        onShow?.()
      } else if (changed && !v) {
        onHide?.()
      }

      setVisible(v)
    },
    [visible, setVisible, onShow, onHide]
  )

  // Synchronize the open state from parent if present.
  useEffect(() => {
    if (!controlled) {
      return
    }

    changeVisible(open)
  }, [controlled, open, changeVisible])

  useImperativeHandle(ref, () => {
    const show = () => {
      if (controlled) {
        console.warn(
          "show() is not permitted and has no effect if the modal state is controlled from the outside."
        )

        return
      }

      changeVisible(true)
    }

    const hide = () => {
      if (controlled) {
        console.warn(
          "hide() is not permitted and has no effect if the modal state is controlled from the outside."
        )

        return
      }

      changeVisible(false)
    }

    return {
      show,
      hide,
    }
  })

  const onOpenChange = useCallback(
    (e: boolean) => {
      if (!controlled) {
        changeVisible(e)

        return
      }

      onOpenChangeRequested?.(e)
    },
    [controlled, changeVisible, onOpenChangeRequested]
  )

  const style = useMemo(() => {
    if (!fixedWidth) {
      return undefined
    }

    return {
      width: fixedWidth,
      maxWidth: fixedWidth,
    } as CSSProperties
  }, [fixedWidth])

  return (
    <DialogPrimitive.Root modal={true} open={visible} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <ModalMask>
          <ModalBox className={cn("min-w-[30rem] max-w-[33rem]", className)} style={style}>
            <ModalTitle>
              {warning && <WarningOutlined className={"mr-2"} />}
              {title}
            </ModalTitle>
            <ModalBody>{children}</ModalBody>
            <ModalActions>
              {customActions ?? (
                <ModalDefaultActions
                  primaryAction={primaryAction}
                  leftAction={leftAction}
                  secondaryAction={secondaryAction}
                />
              )}
            </ModalActions>
          </ModalBox>
        </ModalMask>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

/**
 * This is a self-contained modal component that can be used in three different ways:
 *
 * 1. Imperatively: Capturing a ref of the dialog allows usage of `show()` and `hide()` to display and remove the dialog.
 * - Preferred as it is the most idiomatic for modals & is the simplest approach.
 *
 * 2. Detached: Modal is used in conjunction with the modal dispatcher and the `defaultOpen` property.
 * - Should mainly be used when the modal needs to live longer than the triggering component.
 * - Must call `modalDispatcher.destroy` in `onHide`.
 *
 * 3. Controlled: Modal state is controlled by an outside component through `open`
 * - Should mainly be used when there is a reason to prevent the closing of the modal.
 * - `onOpenChangeRequested` should be handled.
 */
const ModalDialog = forwardRef<ModalDialogInstance, ModalProps>(InnerModalDialog)

ModalDialog.displayName = "Modal"

export { ModalDialog }
