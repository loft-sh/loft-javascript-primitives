import LoadingOutlined from "@ant-design/icons/LoadingOutlined"
import { Slot } from "@radix-ui/react-slot"
import * as React from "react"

import { cn } from "../clsx"

export type ButtonStyles =
  | {
      variant?: "filled" | "outlined" | "ghost"
      appearance?: "primary" | "danger" | "warning" | "success" | "neutral"
    }
  | { variant?: "tertiary" | "ghost" | "link"; appearance?: "primary" | "neutral" }
  | { variant?: "ghost" | "link"; appearance?: "danger" | "neutral" }
  | { variant?: "unstyled"; appearance?: "primary" | "danger" | "warning" | "success" | "neutral" }

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: React.ReactNode
  asChild?: boolean
  loading?: boolean
  size?: "default" | "large" | "small"
  onClickAsync?: (e: React.MouseEvent<HTMLElement, MouseEvent>) => unknown
} & ButtonStyles

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      asChild = false,
      variant = "filled",
      appearance = "primary",
      size = "default",
      type = "button",
      loading,
      onClickAsync,
      ...props
    },
    ref
  ) => {
    const [isLoading, setIsLoading] = React.useState(false)
    const Comp = asChild ? Slot : "button"

    const onClick = React.useCallback(
      async (e: React.MouseEvent<HTMLButtonElement>) => {
        if (onClickAsync) {
          setIsLoading(true)
          try {
            await onClickAsync(e)
          } catch (err) {
            console.error(err)
          } finally {
            setIsLoading(false)
          }
        } else {
          props.onClick?.(e)
        }
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [onClickAsync, props.onClick]
    )

    return (
      <Comp
        data-loading={isLoading || loading}
        type={type}
        className={cn(
          "ring-offset-background group inline-flex cursor-pointer select-none items-center justify-center gap-2 whitespace-nowrap rounded border font-semibold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-offset-2 disabled:pointer-events-none data-[loading=true]:pointer-events-none magic-[disabled,data-[loading=true]]:opacity-60",
          {
            "px-2 py-1 text-sm": size === "default",
            "px-3 py-2 text-base": size === "large",
            "px-2 py-0.5 text-xs": size === "small",
            "border-transparent text-white": variant === "filled",
            "ring-danger-light": appearance === "danger",
            "ring-success-light": appearance === "success",
            "ring-warning-light": appearance === "warning",
            "font-normal": variant === "link",

            "bg-primary-main hover:bg-primary-light focus:bg-primary-light active:bg-primary-dark data-[loading=true]:bg-primary-light":
              appearance === "primary" && variant === "filled",

            "border border-primary-main bg-transparent text-primaryColor-main hover:border-primary-light hover:text-primaryColor-light focus:text-primaryColor-light active:border-primary-dark active:text-primaryColor-dark magic-[disabled,data-[loading=true]]:border-primary-light":
              appearance === "primary" && variant === "outlined",

            "border border-divider-main bg-transparent text-secondary hover:border-divider-main hover:text-primaryColor-light focus:border-divider-main focus:text-primaryColor-light active:border-primary-dark active:text-primaryColor-dark magic-[disabled,data-[loading=true]]:border-primary-light magic-[disabled,data-[loading=true]]:text-primaryColor-light":
              appearance === "primary" && variant === "tertiary",

            "border-transparent bg-transparent  text-primaryColor-main hover:bg-neutral-extra-light hover:text-primaryColor-light focus:bg-neutral-extra-light focus:text-primaryColor-light active:bg-neutral-light active:text-primaryColor-dark magic-[disabled,data-[loading=true]]:border magic-[disabled,data-[loading=true]]:border-primary-main":
              appearance === "primary" && variant === "ghost",

            "border-0 bg-transparent text-primaryColor-main underline hover:text-primaryColor-light focus:text-primaryColor-light active:text-primaryColor-dark":
              appearance === "primary" && variant === "link",

            "bg-danger-main  hover:bg-danger-light focus:bg-danger-light active:bg-danger-dark disabled:bg-danger-light data-[loading=true]:bg-danger-light":
              appearance === "danger" && variant === "filled",

            "border border-danger-main bg-transparent text-danger-main hover:border-danger-light hover:text-danger-light focus:text-danger-light active:border-danger-dark active:text-danger-dark disabled:border-danger-light data-[loading=true]:border-danger-light":
              appearance === "danger" && variant === "outlined",

            "border-transparent bg-transparent text-danger-main hover:bg-neutral-extra-light focus:bg-neutral-extra-light active:bg-neutral-light active:text-danger-dark magic-[disabled,data-[loading=true]]:border magic-[disabled,data-[loading=true]]:border-danger-main":
              appearance === "danger" && variant === "ghost",

            "border-0 bg-transparent text-danger-main underline hover:text-danger-light focus:text-danger-light active:text-danger-dark":
              appearance === "danger" && variant === "link",

            "bg-success-main hover:bg-success-light focus:bg-success-light active:bg-success-dark disabled:bg-success-light data-[loading=true]:bg-success-light":
              appearance === "success" && variant === "filled",

            "border border-success-main bg-transparent text-success-main hover:border-success-light hover:text-success-light focus:text-success-light active:border-success-dark active:text-success-dark disabled:border-success-light data-[loading=true]:border-success-light":
              appearance === "success" && variant === "outlined",

            "bg-warning-main hover:bg-warning-light focus:bg-warning-light active:bg-warning-dark disabled:bg-warning-light data-[loading=true]:bg-warning-light":
              appearance === "warning" && variant === "filled",

            "border border-warning-main bg-transparent text-warning-main hover:border-warning-light hover:text-warning-light focus:text-warning-light active:border-warning-dark active:text-warning-dark disabled:border-warning-light data-[loading=true]:border-warning-light":
              appearance === "warning" && variant === "outlined",
            "bg-neutral-main text-white hover:bg-neutral-light focus:bg-neutral-light active:bg-neutral-dark disabled:bg-neutral-main data-[loading=true]:bg-neutral-main":
              appearance === "neutral" && variant === "filled",

            "border   border-neutral-light text-primary hover:text-secondary focus:text-neutral-main active:border-neutral-dark active:text-neutral-dark disabled:text-primary data-[loading=true]:text-primary":
              appearance === "neutral" && variant === "outlined",

            "bg-transparent text-primary hover:bg-neutral-extra-light focus:bg-neutral-extra-light active:bg-neutral-light active:text-primary":
              appearance === "primary" && variant === "unstyled",
          },

          className
        )}
        ref={ref}
        {...props}
        onClick={(props.onClick || onClickAsync) && onClick}>
        {(loading || isLoading) && <LoadingOutlined className="animate-spin *:size-4" />}
        {props.children}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button }
