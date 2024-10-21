import * as TogglePrimitive from "@radix-ui/react-toggle"
import * as React from "react"

const Toggle = React.forwardRef<
  React.ElementRef<typeof TogglePrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root>
>(({ className, ...props }, ref) => (
  <TogglePrimitive.Root ref={ref} className={className} {...props} />
))

Toggle.displayName = TogglePrimitive.Root.displayName

export { Toggle }
