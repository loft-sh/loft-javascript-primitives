import * as LabelPrimitive from "@radix-ui/react-label"
import * as React from "react"

import { cn } from "../clsx"

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn("peer-disabled:text-disabled", className)}
    {...props}
  />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }
