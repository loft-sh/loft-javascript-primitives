import * as ToastPrimitive from "@radix-ui/react-toast"
import React, { forwardRef, useCallback, useEffect, useRef, useState } from "react"

import { cn } from "../../cn-utils"
import {
  CheckCircleFilled,
  CloseCircleFilled,
  CloseOutlined,
  InfoCircleFilled,
  Loading3QuartersOutlined,
} from "@loft-enterprise/icons"

// Types and Constants
type ToastIconType = "loading" | "success" | "error" | "info" | "warning"

// Icon mapping
const ICON_MAP: Record<ToastIconType, React.ReactNode> = {
  loading: <Loading3QuartersOutlined className="animate-spin text-primaryColor-main" />,
  success: <CheckCircleFilled className="text-success-main" />,
  error: <CloseCircleFilled className="text-danger-main" />,
  info: <InfoCircleFilled className="text-primaryColor-main" />,
  warning: <InfoCircleFilled className="text-warning-main" />,
}

// Toast Icon Component
export const ToastIcon: React.FC<{
  type: ToastIconType | undefined
  className?: string
}> = ({ type, className = "size-4" }) => {
  const [currentIcon, setCurrentIcon] = useState(type)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    if (type !== currentIcon) {
      setIsTransitioning(true)
      let enterTimeout: ReturnType<typeof setTimeout>

      const exitTimeout = setTimeout(() => {
        setCurrentIcon(type)
        enterTimeout = setTimeout(() => {
          setIsTransitioning(false)
        }, 150)
      }, 150)

      return () => {
        clearTimeout(exitTimeout)
        clearTimeout(enterTimeout)
      }
    }
  }, [type, currentIcon])

  const icon = currentIcon ? ICON_MAP[currentIcon] : null

  return (
    <div className={`${className} relative flex items-center justify-center`}>
      <div
        className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ease-in-out ${
          isTransitioning ? "rotate-90 scale-75 opacity-0" : "rotate-0 scale-100 opacity-100"
        }`}>
        {icon}
      </div>
    </div>
  )
}

const ToastProvider = ({
  ...props
}: React.ComponentPropsWithoutRef<typeof ToastPrimitive.Provider>) => (
  <ToastPrimitive.Provider {...props} />
)
ToastProvider.displayName = ToastPrimitive.Provider.displayName

const ToastViewport = forwardRef<
  React.ElementRef<typeof ToastPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport> & {
    expanded?: boolean
  }
>(({ className, expanded, ...props }, ref) => {
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
        "fixed left-1/2 top-0 z-tooltip flex max-h-screen w-full -translate-x-1/2 flex-col p-4",
        className
      )}
      style={{
        maxWidth: expanded ? "75dvw" : "468px",
        maxHeight: expanded ? "75dvh" : "auto",
        transition: "max-width 300ms cubic-bezier(0.23, 1, 0.32, 1)",
      }}
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
    baseTitle?: React.ReactNode
  }
>(({ className, variant = "default", baseTitle, ...props }, ref) => {
  return (
    <ToastPrimitive.Root
      ref={ref}
      aria-label={
        typeof baseTitle === "string" || typeof baseTitle === "number"
          ? String(baseTitle)
          : undefined
      }
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
  type ToastIconType,
  type ToastProps,
  type ToastVariant,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
}
