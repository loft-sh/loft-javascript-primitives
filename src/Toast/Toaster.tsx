import React from "react"

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastIcon,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "./Toast"
import { useToast } from "./useToast"

// Default duration in milliseconds (0 means never auto-dismiss)
const DEFAULT_TOAST_DURATION = 2500

export function Toaster() {
  const { toasts } = useToast()

  const hasExpandedToast = toasts.some((t) => t.open && t.expanded)

  return (
    <ToastProvider swipeDirection="down" duration={DEFAULT_TOAST_DURATION}>
      {toasts.map(({ id, title, description, action, iconType, ...props }) => {
        return (
          <Toast key={id} duration={DEFAULT_TOAST_DURATION} {...props}>
            <div className="grid grid-cols-[24px_1fr] items-start gap-3">
              <ToastIcon type={iconType} className="mt-2.5" />
              <div className="grid gap-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && <ToastDescription>{description}</ToastDescription>}
              </div>
              {action}
            </div>
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport expanded={hasExpandedToast} />
    </ToastProvider>
  )
}
