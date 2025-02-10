import * as React from "react"
import { ChangeEvent, useCallback, useEffect, useImperativeHandle, useRef } from "react"

import Description from "../../../src/components/Description/Description"
import { cn } from "../clsx"

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: "regular" | "in-place"
  autosize?: boolean
  resizable?: boolean
  error?: string
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    { className, resizable = true, error, variant = "regular", onChange, autosize, ...props },
    forwardedRef
  ) => {
    const ref = useRef<HTMLTextAreaElement>(null)

    useImperativeHandle(forwardedRef, () => ref.current!)

    const doAutosize = autosize ?? variant === "in-place"

    const updateHeight = useCallback(() => {
      if (!ref.current) {
        return
      }

      ref.current.style.height = "0px"
      ref.current.style.height = `${ref.current.scrollHeight}px`
    }, [])

    useEffect(() => {
      if (doAutosize) {
        updateHeight()
      }
    }, [doAutosize, updateHeight])

    const onValueChange = useCallback(
      (e: ChangeEvent<HTMLTextAreaElement>) => {
        if (doAutosize) {
          updateHeight()
        }
        onChange?.(e)
      },
      [onChange, doAutosize, updateHeight]
    )

    return (
      <>
        <textarea
          className={cn(
            "flex min-h-[80px] w-full rounded-md border border-divider-main bg-primary-contrast p-2 text-sm",
            "outline-none transition-colors placeholder:text-disabledColor-dark hover:border-primary-light",
            "focus-visible:border-divider-dark disabled:cursor-not-allowed disabled:bg-disabled-light disabled:text-disabledColor-dark",
            {
              "resize-none": !resizable,
              "border-none bg-transparent bg-none p-0": variant === "in-place",
            },
            className
          )}
          ref={ref}
          {...props}
          onChange={onValueChange}
        />
        {error && <Description className={"text-danger-main"}>{error}</Description>}
      </>
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
