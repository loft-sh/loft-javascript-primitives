import CheckCircleFilled from "@ant-design/icons/CheckCircleFilled"
import CloseCircleFilled from "@ant-design/icons/CloseCircleFilled"
import ExclamationCircleFilled from "@ant-design/icons/ExclamationCircleFilled"
import * as React from "react"

import { cn } from "../clsx"

type ExtendedInputContextType = {
  hasPrefix?: boolean
  hasSuffix?: boolean
  error?: boolean
  warning?: boolean
  success?: boolean
  disabled?: boolean
  setDisabled?: (disabled: boolean) => void
}
const ExtendedInputContext = React.createContext<ExtendedInputContextType>({})
const useInputContext = () => React.useContext(ExtendedInputContext)

type ExtendedInputProps = {
  children: React.ReactNode
} & React.HTMLAttributes<HTMLDivElement>

type ExtendedInputContainerProps = ExtendedInputProps & {
  error?: boolean
  warning?: boolean
  success?: boolean
}

const StateIconMap = {
  error: CloseCircleFilled,
  warning: ExclamationCircleFilled,
  success: CheckCircleFilled,
  default: () => null,
}

const useInputContextUpdater = () => {
  const context = React.useContext(ExtendedInputContext)

  return {
    setDisabled: context.setDisabled,
  }
}

const ExtendedInputContainer = React.forwardRef<HTMLDivElement, ExtendedInputContainerProps>(
  ({ children, className, error, warning, success }, ref) => {
    const [context, setContext] = React.useState<ExtendedInputContextType>({
      hasPrefix: false,
      hasSuffix: false,
      error,
      warning,
      success,
    })

    React.useEffect(() => {
      const childArray = React.Children.toArray(children)

      const hasPrefix = childArray.some(
        (child) => React.isValidElement(child) && child.type === ExtendedInputPrefix
      )

      const hasSuffix = childArray.some(
        (child) => React.isValidElement(child) && child.type === ExtendedInputSuffix
      )

      setContext((prev) => ({
        ...prev,
        hasPrefix,
        hasSuffix,
        error,
        warning,
        success,
      }))
    }, [children, error, warning, success])

    const setDisabled = (disabled: boolean) => {
      setContext((prev) => {
        // Only update if the disabled status has actually changed
        if (prev.disabled !== disabled) {
          return { ...prev, disabled }
        }

        return prev
      })
    }

    return (
      <ExtendedInputContext.Provider value={{ ...context, setDisabled }}>
        <div
          ref={ref}
          className={cn(
            `flex items-center justify-between rounded-md border bg-white text-sm text-neutral-dark transition-colors`,
            className
          )}>
          {children}
        </div>
      </ExtendedInputContext.Provider>
    )
  }
)

const ExtendedInputPrefix: React.FC<ExtendedInputProps> = ({ children, className, ...rest }) => {
  return (
    <div
      className={cn("pointer-events-none ml-3 flex select-none items-center", className)}
      {...rest}>
      {children}
    </div>
  )
}

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  inputSize?: "default" | "small" | "large"
  resetable?: boolean
  initialValue?: string | number | readonly string[] | undefined
}

const ExtendedInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ type, inputSize = "default", className, disabled, ...props }, ref) => {
    const { hasPrefix, hasSuffix } = useInputContext()
    const { setDisabled } = useInputContextUpdater()

    React.useEffect(() => {
      setDisabled?.(disabled || false)
    }, [disabled, setDisabled])

    return (
      <input
        type={type}
        disabled={disabled}
        className={cn(
          "peer flex w-full rounded-md border-0 bg-transparent pl-3 outline-none transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-tertiary disabled:cursor-not-allowed disabled:text-disabledColor-dark",
          {
            "w-full": hasPrefix && hasSuffix,
            "py-1 text-sm": inputSize === "default",
            "py-0.5 text-xs": inputSize === "small",
            "py-2 text-base": inputSize === "large",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

const ExtendedInputSuffix: React.FC<ExtendedInputProps> = ({ children, className, ...rest }) => {
  const { error, warning, success, disabled } = useInputContext()
  const StateIconComponent =
    StateIconMap[error ? "error" : warning ? "warning" : success ? "success" : "default"]

  return (
    <div
      className={cn("pointer-events-none mr-3 flex select-none items-center gap-1", className)}
      {...rest}>
      {children}
      <StateIconComponent
        className={cn("*:transition-colors", {
          "*:!fill-success-main group-hover:*:!fill-success-light ": success,
          "*:!fill-warning-main group-hover:*:!fill-warning-light": warning,
          "*:!fill-danger-main group-hover:*:!fill-danger-light": error,
          "*:!fill-disabled-dark group-hover:group-has-[:disabled]:*:!fill-disabled-dark": disabled,
        })}
      />
    </div>
  )
}

ExtendedInputSuffix.displayName = "ExtendedInputSuffix"
ExtendedInput.displayName = "ExtendedInput"
ExtendedInputPrefix.displayName = "ExtendedInputPrefix"
ExtendedInputContainer.displayName = "ExtendedInputContainer"

export { ExtendedInput, ExtendedInputContainer, ExtendedInputPrefix, ExtendedInputSuffix }
