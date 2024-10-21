import * as React from "react"

import { cn } from "../clsx"
import { Tooltip } from "./Tooltip"
import {
  CheckCircleFilled,
  CloseCircleFilled,
  ExclamationCircleFilled,
} from "@loft-enterprise/icons"

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  preffix?: React.ReactNode
  suffix?: React.ReactNode
  error?: boolean
  statusText?: string
  warning?: boolean
  success?: boolean
  inputSize?: "default" | "small" | "large"
  inputClassName?: string
  resetable?: boolean
  initialValue?: string | number | readonly string[] | undefined
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      preffix,
      suffix,
      error,
      warning,
      success,
      inputSize = "default",
      resetable,
      inputClassName,
      placeholder,
      statusText,
      ...props
    },
    ref
  ) => {
    const StateIconMap = {
      error: CloseCircleFilled,
      warning: ExclamationCircleFilled,
      success: CheckCircleFilled,
      default: () => null,
    }

    const initialValue = React.useMemo(() => props.value, [])

    const [value, setValue] = React.useState(initialValue || "")

    React.useEffect(() => {
      setValue(props.value || "")
    }, [props.value])

    const handleReset = () => {
      setValue(initialValue || "")
      if (props.onChange) {
        props.onChange({
          target: { value: initialValue || "" },
        } as React.ChangeEvent<HTMLInputElement>)
      }
    }

    // Let's make sure that we have only one icon
    const StateIcon =
      StateIconMap[error ? "error" : warning ? "warning" : success ? "success" : "default"]

    if (preffix || suffix) {
      const icon = (
        <StateIcon
          className={cn("*:transition-colors", {
            "*:!fill-success-main group-hover:*:!fill-success-light ": success,
            "*:!fill-warning-main group-hover:*:!fill-warning-light": warning,
            "*:!fill-danger-main group-hover:*:!fill-danger-light": error,
            "*:!fill-disabled-dark group-hover:group-has-[:disabled]:*:!fill-disabled-dark":
              props.disabled,
          })}
        />
      )

      return (
        <div
          ref={ref}
          role="group"
          className={cn(
            "group flex items-center justify-between gap-1 rounded-md border border-divider-main bg-white text-sm text-tertiary transition-colors focus-within:border-primary-dark focus-within:outline-none hover:border-primary-light has-[:disabled]:cursor-not-allowed has-[:disabled]:bg-disabled-light [&_svg]:size-4 [&_svg]:fill-neutral-dark",
            {
              "[&_svg]:size-4 ": inputSize === "default",
              "[&_svg]:size-5": inputSize === "large",
            },
            className
          )}>
          {preffix && (
            <div className="pointer-events-none ml-3 flex select-none items-center">{preffix}</div>
          )}
          <input
            type={type}
            placeholder={placeholder}
            className={cn(
              "peer flex w-full rounded-md border-0 bg-transparent pl-3 text-black outline-none transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-tertiary disabled:cursor-not-allowed disabled:text-disabledColor-dark",
              {
                "w-full": preffix && suffix,
                "py-1 text-sm": inputSize === "default",
                "py-0.5 text-xs": inputSize === "small",
                "py-2 text-base": inputSize === "large",
              },
              inputClassName
            )}
            {...props}
          />
          {suffix && (
            <div
              className={cn("mr-3 flex select-none items-center gap-1", {
                "pointer-events-none": !statusText,
              })}>
              {suffix}
              {statusText ? (
                <Tooltip delayDuration={0} className="z-top-level" content={statusText}>
                  {icon}
                </Tooltip>
              ) : (
                icon
              )}
            </div>
          )}
        </div>
      )
    }

    return (
      <div className="relative flex items-center">
        {resetable && value !== initialValue && (
          <span
            role="button"
            className="absolute -top-[3.125rem] bottom-0 right-0 flex cursor-pointer items-center pr-3 text-xs font-semibold text-danger-main"
            onClick={handleReset}>
            Reset
          </span>
        )}
        <input
          type={type}
          className={cn(
            "placeholder:text-muted-foreground peer flex w-full rounded-md border  border-divider-main bg-primary-contrast px-3 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-tertiary hover:border-primary-light focus:border-primary-light focus-visible:outline-none active:border-primary-dark disabled:cursor-not-allowed disabled:opacity-50",
            {
              "py-1 text-sm": inputSize === "default",
              "py-0.5 text-xs": inputSize === "small",
              "py-2 text-base": inputSize === "large",
            },
            className
          )}
          {...props}
          placeholder={placeholder}
          ref={ref}
          {...(resetable
            ? {
                value: value,
                onChange: (e) => {
                  setValue(e.target.value)
                  if (props.onChange) {
                    props.onChange(e)
                  }
                },
              }
            : {})}
        />
        <div className="pointer-events-none -ml-5 mr-3 flex select-none items-center gap-1">
          <StateIcon
            className={cn("*:transition-colors", {
              "*:!fill-success-main group-hover:*:!fill-success-light ": success,
              "*:!fill-warning-main group-hover:*:!fill-warning-light": warning,
              "*:!fill-danger-main group-hover:*:!fill-danger-light": error,
              "*:!fill-disabled-dark group-hover:group-has-[:disabled]:*:!fill-disabled-dark":
                props.disabled,
            })}
          />
        </div>
      </div>
    )
  }
)

Input.displayName = "Input"

export { Input }
