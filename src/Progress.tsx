import * as ProgressPrimitive from "@radix-ui/react-progress"
import * as React from "react"

import cn from "../clsx/index"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => {
  const procent = Math.round((value || 0) * 100)

  return (
    <div className="flex w-full items-center justify-center gap-2">
      <span className="text-xs text-primaryColor-dark">{procent}%</span>
      <ProgressPrimitive.Root
        ref={ref}
        className={cn(
          "relative h-2 w-full overflow-hidden rounded-full border-[0.25px]   border-divider-main bg-gray-20",
          className
        )}
        style={{
          // Fix overflow clipping in Safari
          // https://gist.github.com/domske/b66047671c780a238b51c51ffde8d3a0
          transform: "translateZ(0)",
        }}
        {...props}>
        <ProgressPrimitive.Indicator
          className="ease-[cubic-bezier(0.65, 0, 0.35, 1)] h-2 w-full bg-primary-main transition-transform duration-[200ms]"
          style={{ transform: `translateX(-${100 - procent}%)` }}
        />
      </ProgressPrimitive.Root>
    </div>
  )
})

Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
