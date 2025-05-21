import * as React from "react"
import { useCallback, useImperativeHandle, useRef, useState } from "react"

import { Button } from "../../Button"
import { Input } from "../../Input"
import { PlusOutlined } from "@loft-enterprise/icons"

type CommonSelectCustomInputProps = Omit<
  React.ComponentPropsWithoutRef<typeof Input>,
  | "preffix"
  | "onMouseDown"
  | "onKeyDown"
  | "className"
  | "inputClassName"
  | "placeholder"
  | "type"
  | "spellCheck"
  | "prefixClassName"
> & {
  onCustomOptionAdd?: (value: string) => void
  placeholder?: string
  buttonText?: string
}

export const CommonSelectCustomInput = React.forwardRef<
  React.ElementRef<typeof Input>,
  CommonSelectCustomInputProps
>(({ onCustomOptionAdd, placeholder, buttonText = "Add custom option", ...props }, ref) => {
  const innerRef = useRef<HTMLInputElement>(null)
  const [value, setValue] = React.useState("")
  const [isInputVisible, setIsInputVisible] = useState(false)

  const focusInput = useCallback(() => {
    innerRef.current?.focus()
  }, [])

  const stopPropagation = useCallback((e: { stopPropagation: () => void }) => {
    e.stopPropagation()
  }, [])

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (value.trim() && onCustomOptionAdd) {
        onCustomOptionAdd(value.trim())
        setValue("")
        setIsInputVisible(false)
      }
    },
    [value, onCustomOptionAdd]
  )

  useImperativeHandle(ref, () => innerRef.current!)

  const handleClick = useCallback(() => {
    setIsInputVisible(true)
    setTimeout(() => {
      innerRef.current?.focus()
    }, 0)
  }, [])

  if (!isInputVisible) {
    return (
      <div className="border-t border-divider-main">
        <Button type="button" onClick={handleClick} variant="ghost" className="pl-0">
          <PlusOutlined className="size-4 *:size-4" />
          {buttonText}
        </Button>
      </div>
    )
  }

  return (
    <div className="w-[calc(var(--radix-select-trigger-width))] border-t border-divider-main">
      <form onSubmit={handleSubmit} className="box-border flex flex-row items-center">
        <Input
          ref={innerRef}
          className="shadow-none w-full border-none"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          preffix={
            <PlusOutlined className="!cursor-text [&_svg]:fill-primary-main" onClick={focusInput} />
          }
          prefixClassName="pointer-events-auto ml-0"
          onMouseDown={stopPropagation}
          onKeyDown={stopPropagation}
          inputClassName="pl-0.5"
          placeholder={placeholder || "Add custom option..."}
          type="text"
          spellCheck={false}
          {...props}
        />
      </form>
    </div>
  )
})
CommonSelectCustomInput.displayName = "CommonSelectCustomInput"
