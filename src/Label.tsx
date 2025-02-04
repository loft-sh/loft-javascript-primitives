import * as LabelPrimitive from "@radix-ui/react-label"
import * as React from "react"

import { cn } from "../clsx"

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & {
    size?: "small" | "large"
  }
>(({ className, size, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(
      "block pb-1 font-normal text-primary peer-disabled:text-disabled",
      {
        "text-xs": !size || size === "small",
        "text-sm": size === "large",
      },
      className
    )}
    {...props}
  />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }
