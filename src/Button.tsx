import { Slot } from "@radix-ui/react-slot"
import * as React from "react"

import { cn } from "../clsx"
import { Loading } from "./Loading"

export function getButtonClasses({
  variant = "filled",
  appearance = "neutral",
  size = "default",
  clipped,
  className,
}: {
  variant?: ButtonStyles["variant"]
  appearance?: ButtonStyles["appearance"]
  size?: "default" | "large" | "small"
  clipped?: boolean
  className?: string
} = {}) {
  return cn(
    "ring-offset-background group inline-flex cursor-pointer select-none items-center justify-center gap-2 whitespace-nowrap rounded border font-semibold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-offset-2 disabled:pointer-events-none data-[loading=true]:pointer-events-none magic-[disabled,data-[loading=true]]:opacity-60",
    {
      "px-2 py-1 text-sm": size === "default",
      "px-3 py-2 text-base": size === "large",
      "px-2 py-0.5 text-xs": size === "small",
      "text-white shadow-small data-[loading=true]:border-transparent disabled:border-transparent":
        variant === "filled",
      "bg-body-main shadow-small": variant === "outlined",
      "font-normal": variant === "link",

      "border-primary-dark bg-primary-main hover:bg-primary-mid-light hover:border-primary-main active:border-primary-main focus-visible:border-primary-main focus-visible:bg-primary-mid-light active:bg-primary-dark data-[loading=true]:bg-primary-light":
        appearance === "primary" && variant === "filled",

      "border border-primary-main bg-transparent text-primaryColor-main hover:border-primary-mid-light hover:text-primaryColor-mid-light focus-visible:text-primaryColor-light active:border-primary-dark active:text-primaryColor-dark magic-[disabled,data-[loading=true]]:border-primary-light":
        appearance === "primary" && variant === "outlined",

      "border border-divider-main bg-transparent text-secondary hover:border-divider-main hover:text-primaryColor-light focus-visible:border-divider-main focus-visible:text-primaryColor-light active:border-primary-dark active:text-primaryColor-dark magic-[disabled,data-[loading=true]]:border-primary-light magic-[disabled,data-[loading=true]]:text-primaryColor-light":
        appearance === "primary" && variant === "tertiary",

      "border-transparent bg-transparent text-primaryColor-main hover:bg-neutral-extra-light hover:text-primaryColor-mid-light focus-visible:bg-neutral-extra-light focus-visible:text-primaryColor-light active:bg-neutral-light active:text-primaryColor-dark":
        appearance === "primary" && variant === "ghost",

      "border-0 bg-transparent text-primaryColor-main underline hover:text-primaryColor-mid-light focus-visible:text-primaryColor-light active:text-primaryColor-dark":
        appearance === "primary" && variant === "link",

      "bg-brand-main border-brand-dark hover:bg-brand-mid-light hover:border-brand-main active:border-brand-main focus-visible:border-brand-main focus-visible:bg-brand-mid-light active:bg-brand-dark data-[loading=true]:bg-brand-light":
        appearance === "brand" && variant === "filled",

      "border border-brand-main bg-transparent text-brand-main hover:border-brand-mid-light hover:text-brand-mid-light focus-visible:text-brand-light active:border-brand-dark active:text-brand-dark magic-[disabled,data-[loading=true]]:border-brand-light":
        appearance === "brand" && variant === "outlined",

      "border border-divider-main bg-transparent text-secondary hover:border-divider-main hover:text-brand-light focus-visible:border-divider-main focus-visible:text-brand-light active:border-brand-dark active:text-brand-dark magic-[disabled,data-[loading=true]]:border-brand-light magic-[disabled,data-[loading=true]]:text-brand-light":
        appearance === "brand" && variant === "tertiary",

      "border-transparent bg-transparent text-brand-main hover:bg-neutral-extra-light hover:text-brand-mid-light focus-visible:bg-neutral-extra-light focus-visible:text-brand-light active:bg-neutral-light active:text-brand-dark":
        appearance === "brand" && variant === "ghost",

      "border-0 bg-transparent text-brand-main underline hover:text-brand-mid-light focus-visible:text-brand-light active:text-brand-dark":
        appearance === "brand" && variant === "link",

      "bg-danger-main border-danger-dark  hover:bg-danger-light focus-visible:border-danger-main active:border-danger-main hover:border-danger-main focus-visible:bg-danger-light active:bg-danger-dark disabled:bg-danger-mid-light data-[loading=true]:bg-danger-light":
        appearance === "danger" && variant === "filled",

      "border border-danger-main bg-transparent text-danger-main hover:border-danger-mid-light hover:text-danger-mid-light focus-visible:text-danger-light active:border-danger-dark active:text-danger-dark disabled:border-danger-light data-[loading=true]:border-danger-light":
        appearance === "danger" && variant === "outlined",

      "border-transparent bg-transparent text-danger-main hover:bg-neutral-extra-light focus-visible:bg-neutral-extra-light active:bg-neutral-light active:text-danger-dark magic-[disabled,data-[loading=true]]:border magic-[disabled,data-[loading=true]]:border-danger-main":
        appearance === "danger" && variant === "ghost",

      "text-neutral-dark hover:bg-neutral-extra-light focus-visible:bg-neutral-extra-light active:bg-neutral-light active:text-neutral-dark":
        appearance === "neutral" && variant === "ghost",

      "border-0 bg-transparent text-danger-main underline hover:text-danger-extra-light focus-visible:text-danger-light active:text-danger-dark":
        appearance === "danger" && variant === "link",

      "bg-success-main border-success-dark Hover:border-success-main hover:bg-success-mid-light focus-visible:border-success-main focus-visible:bg-success-mid-light active:border-success-main active:bg-success-dark disabled:bg-success-light data-[loading=true]:bg-success-light":
        appearance === "success" && variant === "filled",

      "border border-success-main bg-transparent text-success-main hover:border-success-mid-light hover:text-success-mid-light focus-visible:text-success-light active:border-success-dark active:text-success-dark disabled:border-success-light data-[loading=true]:border-success-light":
        appearance === "success" && variant === "outlined",

      "bg-warning-main border-warning-dark hover:bg-warning-mid-light hover:border-warning-main focus-visible:border-warning-main focus-visible:bg-warning-mid-light active:border-warning-main active:bg-warning-dark disabled:bg-warning-light data-[loading=true]:bg-warning-light":
        appearance === "warning" && variant === "filled",

      "border border-warning-main bg-transparent text-warning-main hover:border-warning-mid-light hover:text-warning-light focus-visible:text-warning-light active:border-warning-dark active:text-warning-dark disabled:border-warning-light data-[loading=true]:border-warning-light":
        appearance === "warning" && variant === "outlined",
      "bg-neutral-main border-neutral-dark text-white hover:border-neutral-main focus-visible:border-neutral-main active:border-neutral-main hover:bg-neutral-mid-light focus-visible:bg-neutral-mid-light active:bg-neutral-dark disabled:bg-neutral-main data-[loading=true]:bg-neutral-main":
        appearance === "neutral" && variant === "filled",

      "border border-neutral-light text-primary hover:bg-neutral-extra-light hover:text-secondary focus-visible:text-neutral-light active:border-neutral-dark active:text-neutral-dark disabled:text-primary data-[loading=true]:text-primary":
        appearance === "neutral" && variant === "outlined",

      "bg-transparent text-primary hover:bg-neutral-mid-light focus-visible:bg-neutral-mid-light active:bg-neutral-light active:text-primary":
        appearance === "primary" && variant === "unstyled",

      "px-0 py-0 hover:bg-transparent focus-visible:bg-transparent active:bg-transparent": clipped,
    },
    className
  )
}

export type ButtonStyles =
  | {
      variant?: "filled" | "outlined" | "ghost"
      appearance?: "primary" | "danger" | "warning" | "success" | "neutral" | "brand"
    }
  | { variant?: "tertiary" | "ghost" | "link"; appearance?: "primary" | "neutral" }
  | { variant?: "ghost" | "link"; appearance?: "danger" | "neutral" }
  | { variant?: "unstyled"; appearance?: "primary" | "danger" | "warning" | "success" | "neutral" }

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: React.ReactNode
  asChild?: boolean
  loading?: boolean
  clipped?: boolean
  size?: "default" | "large" | "small"
  onClickAsync?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => unknown
} & ButtonStyles

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      asChild = false,
      variant = "filled",
      appearance = "neutral",
      size = "default",
      clipped,
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
        className={getButtonClasses({
          variant,
          appearance,
          size,
          clipped,
          className: cn(
            {
              "ring-danger-light": appearance === "danger",
              "ring-success-light": appearance === "success",
              "ring-warning-light": appearance === "warning",
            },
            className
          ),
        })}
        ref={ref}
        {...props}
        onClick={(props.onClick || onClickAsync) && onClick}>
        {(loading || isLoading) && (
          <Loading spinnerClassName={"size-4 ![color:inherit]"} variant={"pronounced"} />
        )}
        {props.children}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button }
