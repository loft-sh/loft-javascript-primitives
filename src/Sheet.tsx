"use client"

import * as SheetPrimitive from "@radix-ui/react-dialog"
import * as React from "react"

import { cn } from "../clsx"

const CLIENT_MESSAGE_CLASS_NAME = "ant-message"

const Sheet = SheetPrimitive.Root

const SheetTrigger = SheetPrimitive.Trigger

const SheetClose = SheetPrimitive.Close

const SheetPortal = SheetPrimitive.Portal

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
    ref={ref}
  />
))
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName

interface SheetContentProps extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content> {
  /** Which side of the screen the sheet should appear from */
  side?: "top" | "right" | "bottom" | "left"
  /** Width of the sheet content. Numbers are interpreted as pixels, strings are interpreted as CSS values */
  width?: number | string
  wrapperClassName?: string
  /** Whether to show the overlay backdrop */
  showOverlay?: boolean
}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  SheetContentProps
>(
  (
    {
      side = "right",
      className,
      children,
      width,
      wrapperClassName,
      showOverlay = true,
      style: externalStyle,
      ...props
    },
    ref
  ) => {
    const [minWidth, setMinWidth] = React.useState("650px")

    const setMinWidthBasedOnWindowWidth = React.useCallback(() => {
      if (window.innerWidth < 650) {
        setMinWidth("calc(100vw - 60px)")
      } else {
        setMinWidth("650px")
      }
    }, [])

    // This is mostly to accomodate the old drawers and to give them a min width ( doesn't really break anything for our ones )
    React.useEffect(() => {
      setMinWidthBasedOnWindowWidth()

      window.addEventListener("resize", () => {
        setMinWidthBasedOnWindowWidth()
      })

      return () => {
        window.removeEventListener("resize", () => {
          setMinWidthBasedOnWindowWidth()
        })
      }
    }, [])

    const sideToClassNames = {
      top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
      bottom:
        "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
      left: "inset-y-0 left-0 h-full border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left",
      right:
        "inset-y-0 right-0 h-full border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
    }

    const mergedStyle = React.useMemo(() => {
      const style: React.CSSProperties = {
        ...externalStyle,
        // Add smooth transition for width changes
        transition:
          "width 0.15s cubic-bezier(0.25, 0.8, 0.25, 1), max-width 0.15s cubic-bezier(0.25, 0.8, 0.25, 1)",
      }

      if (side === "right" || side === "left") {
        style.maxWidth = "calc(100vw - 60px)"

        if (width) {
          const widthValue = typeof width === "number" ? `${width}px` : width
          style.maxWidth = `min(${widthValue}, calc(100vw - 60px))`
        }
      } else {
        if (width) {
          style.width = typeof width === "number" ? `${width}px` : width
        }
      }

      return style
    }, [width, side, externalStyle])

    return (
      <SheetPortal>
        {showOverlay && <SheetOverlay />}
        <SheetPrimitive.Content
          ref={ref}
          className={cn(
            "fixed z-50 h-full min-w-[650px] gap-4 shadow-lg transition ease-in-out data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:duration-300 data-[state=open]:duration-200",
            "flex flex-col",
            sideToClassNames[side],
            className
          )}
          style={{ ...mergedStyle, minWidth }}
          onPointerDownOutside={(event) => {
            const target = event.target as HTMLElement
            if (target.closest(`.${CLIENT_MESSAGE_CLASS_NAME}`)) {
              event.preventDefault()
            }
          }}
          {...props}>
          <div className={cn("flex-1 overflow-auto", wrapperClassName)}>
            <div className="h-full w-full overflow-x-auto [&_pre]:max-w-full [&_pre]:overflow-x-auto [&_pre]:whitespace-pre">
              {children}
            </div>
          </div>
        </SheetPrimitive.Content>
      </SheetPortal>
    )
  }
)

SheetContent.displayName = SheetPrimitive.Content.displayName

const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex-none border-b border-divider-main px-10 py-6 text-lg font-semibold text-primary",
      className
    )}
    {...props}
  />
)
SheetHeader.displayName = "SheetHeader"

const SheetFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "z-10 flex h-14 w-full flex-none justify-end border-t border-divider-main bg-white p-3",
      className
    )}
    {...props}
  />
)
SheetFooter.displayName = "SheetFooter"

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title ref={ref} className={cn("text-lg font-semibold", className)} {...props} />
))
SheetTitle.displayName = SheetPrimitive.Title.displayName

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description ref={ref} className={cn("text-sm", className)} {...props} />
))
SheetDescription.displayName = SheetPrimitive.Description.displayName

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
