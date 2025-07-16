import * as React from "react"
import { useCallback, useId, useImperativeHandle, useMemo, useRef, useState } from "react"

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
  | "value"
  | "onChange"
  | "statusText"
> & {
  onCustomOptionAdd?: (value: string) => void
  placeholder?: string
  buttonText?: string
  validator?: (value: string) => string | undefined
}

export const CommonSelectCustomInput = React.forwardRef<
  React.ElementRef<typeof Input>,
  CommonSelectCustomInputProps
>(
  (
    { onCustomOptionAdd, validator, placeholder, buttonText = "Add custom option", ...props },
    ref
  ) => {
    const innerRef = useRef<HTMLInputElement>(null)
    const buttonRef = useRef<HTMLButtonElement>(null)
    const [value, setValue] = useState("")
    const [dirty, setDirty] = useState(false)
    const [isInputVisible, setIsInputVisible] = useState(false)
    const controlledRegionId = useId()

    const error = useMemo(() => {
      return validator?.(value)
    }, [value, validator])

    const focusInput = useCallback(() => {
      innerRef.current?.focus()
    }, [])

    const stopPropagation = useCallback((e: { stopPropagation: () => void }) => {
      e.stopPropagation()
    }, [])

    const handleSubmit = useCallback(
      (e: React.FormEvent) => {
        e.preventDefault()
        if (!error && value.trim() && onCustomOptionAdd) {
          onCustomOptionAdd(value.trim())
          setValue("")
          setDirty(false)
          setIsInputVisible(false)
          buttonRef.current?.focus()
        }
      },
      [value, onCustomOptionAdd, error]
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
        <div className="w-full border-t border-divider-main px-1">
          <Button
            ref={buttonRef}
            type="button"
            onClick={handleClick}
            variant="ghost"
            className="w-full justify-start pl-2 pt-[6px]"
            aria-expanded="false"
            aria-controls={controlledRegionId}>
            <PlusOutlined className="size-4 *:size-4" aria-hidden="true" />
            {buttonText}
          </Button>
        </div>
      )
    }

    return (
      <div
        id={controlledRegionId}
        role="region"
        aria-label={buttonText}
        className="w-full border-t border-divider-main py-1 pl-2 pr-2 pt-[6px]">
        <form onSubmit={handleSubmit} className="m-0 box-border flex flex-row items-center p-0">
          <Input
            ref={innerRef}
            className="shadow-none w-full border-none p-0 pb-0"
            inputClassName="py-0 pb-0"
            error={dirty && !!error}
            statusText={dirty ? error : undefined}
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              setDirty(true)
            }}
            preffix={
              <PlusOutlined
                className="!cursor-text [&_svg]:fill-primary-main"
                onClick={focusInput}
                aria-hidden="true"
              />
            }
            prefixClassName="pointer-events-auto ml-0"
            onMouseDown={stopPropagation}
            onKeyDown={stopPropagation}
            placeholder={placeholder || "Add custom option..."}
            aria-label={placeholder || "Add custom option"}
            type="text"
            spellCheck={false}
            {...props}
          />
        </form>
      </div>
    )
  }
)
CommonSelectCustomInput.displayName = "CommonSelectCustomInput"
