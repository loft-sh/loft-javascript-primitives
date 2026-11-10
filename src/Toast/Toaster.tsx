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

export function Toaster() {
  const { toasts } = useToast()

  const hasExpandedToast = toasts.some((t) => t.open && t.expanded)

  return (
    <ToastProvider swipeDirection="down" duration={Infinity}>
      {toasts.map(({ id, title, description, action, iconType, ...props }) => {
        return (
          <Toast key={id} duration={Infinity} {...props}>
            <div className="grid w-full min-w-0 grid-cols-[24px_minmax(0,1fr)] items-start gap-3">
              <ToastIcon type={iconType} className="mt-2.5" />
              <div className="grid min-w-0 gap-1">
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
