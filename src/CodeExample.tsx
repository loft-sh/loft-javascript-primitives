import React, { forwardRef } from "react"

import { cn } from "../clsx"

export type CodeExampleProps = {
  children: React.ReactNode
  className?: string
}

const CodeExample = forwardRef<HTMLPreElement, CodeExampleProps>(({ children, className }, ref) => {
  return (
    <pre className={cn("flex w-full flex-row text-xs text-tertiary", className)} ref={ref}>
      {children}
    </pre>
  )
})
CodeExample.displayName = "CodeExample"

export { CodeExample }
