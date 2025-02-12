import CheckCircleFilled from "@ant-design/icons/CheckCircleFilled"
import CloseCircleFilled from "@ant-design/icons/CloseCircleFilled"
import ExclamationCircleFilled from "@ant-design/icons/ExclamationCircleFilled"
import EyeInvisibleOutlined from "@ant-design/icons/EyeInvisibleOutlined"
import EyeOutlined from "@ant-design/icons/EyeOutlined"
import * as React from "react"

import { cn } from "../clsx"
import { Tooltip } from "./Tooltip"

export type InputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "className"> & {
  variant?: "regular" | "in-place"
  preffix?: React.ReactNode
  prefixClassName?: string
  suffix?: React.ReactNode
  error?: boolean
  statusText?: string
  warning?: boolean
  success?: boolean
  inputSize?: "default" | "small" | "large"
  inputClassName?: string
  className?: string
  initialValue?: string | number | readonly string[] | undefined
  groupRef?: React.Ref<HTMLDivElement>
  showToggle?: boolean
  inline?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      variant = "regular",
      type,
      preffix,
      suffix,
      error,
      warning,
      success,
      inputSize = "default",
      inputClassName,
      placeholder,
      statusText,
      groupRef,
      prefixClassName,
      showToggle,
      className,
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

    const [showPassword, setShowPassword] = React.useState(false)

    // Let's make sure that we have only one icon
    const StateIcon =
      StateIconMap[error ? "error" : warning ? "warning" : success ? "success" : "default"]

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
        role="group"
        ref={groupRef}
        className={cn(
          "group flex items-center justify-between gap-1 rounded-md border border-divider-main bg-white text-sm text-tertiary transition-colors focus-within:border-primary-main focus-within:outline-none hover:border-primary-light has-[:disabled]:cursor-not-allowed has-[:disabled]:bg-disabled-light [&_svg]:size-4 [&_svg]:fill-neutral-dark",
          {
            "[&_svg]:size-4 ": inputSize === "default",
            "[&_svg]:size-5": inputSize === "large",
            "border-none bg-transparent bg-none focus-within:border-none hover:outline hover:outline-[1px] hover:outline-primary-main":
              variant === "in-place",
          },
          className
        )}>
        {preffix && (
          <div
            className={cn(
              "pointer-events-none ml-3 flex select-none items-center",
              prefixClassName
            )}>
            {preffix}
          </div>
        )}
        <input
          ref={ref}
          type={type === "password" ? (showPassword ? "text" : "password") : type}
          placeholder={placeholder}
          className={cn(
            "peer flex w-full rounded-md border-0 bg-transparent pl-3 text-primary outline-none transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-tertiary disabled:cursor-not-allowed disabled:text-disabledColor-dark",
            {
              "w-full": preffix && suffix,
              "py-1 text-sm": inputSize === "default",
              "py-0.5 text-xs": inputSize === "small",
              "py-2 text-base": inputSize === "large",
              "pl-1": preffix,
              "px-0": variant === "in-place",
            },
            inputClassName
          )}
          {...props}
        />
        {(suffix || (type === "password" && showToggle) || error) && (
          <div
            className={cn("mr-3 flex select-none items-center gap-1", {
              "pointer-events-none": !statusText && !(type === "password" && showToggle),
            })}>
            {suffix}
            {statusText ? (
              <Tooltip delayDuration={0} className="z-top-level" content={statusText}>
                {icon}
              </Tooltip>
            ) : (
              icon
            )}
            {type === "password" && showToggle && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="pointer-events-auto z-10 cursor-pointer leading-[0] hover:opacity-80">
                {showPassword ? (
                  <EyeInvisibleOutlined className="size-4 fill-neutral-dark" />
                ) : (
                  <EyeOutlined className="size-4 fill-neutral-dark" />
                )}
              </button>
            )}
          </div>
        )}
      </div>
    )
  }
)

Input.displayName = "Input"

export { Input }
