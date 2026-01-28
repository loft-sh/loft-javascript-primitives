import * as ToastPrimitive from "@radix-ui/react-toast"
import React, { forwardRef, useCallback, useEffect, useRef } from "react"

import { cn } from "../../cn-utils"
import { CloseOutlined } from "@loft-enterprise/icons"

const ToastProvider = ({
  ...props
}: React.ComponentPropsWithoutRef<typeof ToastPrimitive.Provider>) => (
  <ToastPrimitive.Provider {...props} />
)
ToastProvider.displayName = ToastPrimitive.Provider.displayName

const ToastViewport = forwardRef<
  React.ElementRef<typeof ToastPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>
>(({ className, ...props }, ref) => {
  const viewportRef = useRef<React.ElementRef<typeof ToastPrimitive.Viewport>>(null)

  // Compose refs manually
  const setRefs = useCallback(
    (node: React.ElementRef<typeof ToastPrimitive.Viewport> | null) => {
      // @ts-ignore - We need to bypass readonly constraint
      viewportRef.current = node
      if (typeof ref === "function") {
        ref(node)
      } else if (ref) {
        ref.current = node
      }
    },
    [ref]
  )

  // Disable the problematic pause/resume event listeners. This pretty much disables the hover related auto-dismiss. This is useful for cases where an error is shown and the user needs to copy it, or do multiple actions to it and we don't want to auto-dismiss.
  useEffect(() => {
    const viewport = viewportRef.current
    if (viewport) {
      const preventPause = (e: Event) => {
        e.stopImmediatePropagation()
      }

      viewport.addEventListener("pointermove", preventPause, { capture: true })
      viewport.addEventListener("pointerleave", preventPause, { capture: true })

      return () => {
        viewport.removeEventListener("pointermove", preventPause, { capture: true })
        viewport.removeEventListener("pointerleave", preventPause, { capture: true })
      }
    }
  }, [])

  return (
    <ToastPrimitive.Viewport
      ref={setRefs}
      className={cn(
        "fixed left-1/2 top-0 z-tooltip flex max-h-screen w-full -translate-x-1/2 flex-col p-4 md:max-w-[468px]",
        className
      )}
      {...props}
    />
  )
})
ToastViewport.displayName = ToastPrimitive.Viewport.displayName

type ToastVariant = "default" | "destructive" | "success" | "warning"

const Toast = forwardRef<
  React.ElementRef<typeof ToastPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Root> & {
    variant?: ToastVariant
  }
>(({ className, variant = "default", ...props }, ref) => {
  return (
    <ToastPrimitive.Root
      ref={ref}
      className={cn(
        "group pointer-events-auto relative flex w-full items-start space-x-2 overflow-visible rounded-md border bg-white p-4 px-6 shadow-lg transition-all duration-300 data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[state=closed]:animate-out data-[state=open]:animate-in data-[swipe=end]:animate-out data-[swipe=move]:transition-none data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-top-full data-[state=open]:slide-in-from-top-full",
        {
          "text-primary shadow-toast": variant === "default",
          "border-danger-light [&>svg]:text-danger-dark": variant === "destructive",
          "border-success-light [&>svg]:text-success-dark": variant === "success",
          "border-warning-light [&>svg]:text-warning-dark": variant === "warning",
        },
        className
      )}
      {...props}
    />
  )
})
Toast.displayName = ToastPrimitive.Root.displayName

const ToastClose = forwardRef<
  React.ElementRef<typeof ToastPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Close
    ref={ref}
    className={cn(
      "absolute right-2 top-[0.875rem] rounded-md p-1 text-primary/50 opacity-0 transition-opacity hover:text-primary focus:opacity-100 focus:outline-none focus:ring-1 group-hover:opacity-100",
      className
    )}
    {...props}>
    <CloseOutlined className="h-4 w-4" />
  </ToastPrimitive.Close>
))
ToastClose.displayName = ToastPrimitive.Close.displayName

const ToastTitle = forwardRef<
  React.ElementRef<typeof ToastPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Title
    ref={ref}
    className={cn("text-sm font-semibold transition-all duration-300 [&+div]:text-xs", className)}
    {...props}
  />
))
ToastTitle.displayName = ToastPrimitive.Title.displayName

const ToastDescription = forwardRef<
  React.ElementRef<typeof ToastPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Description
    ref={ref}
    className={cn("text-sm opacity-90 transition-all duration-300", className)}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitive.Description.displayName

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>

export {
  type ToastProps,
  type ToastVariant,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
}
