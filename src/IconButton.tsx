import { Slot } from "@radix-ui/react-slot"
import * as React from "react"

import { cx } from "../clsx"
import { LoadingOutlined } from "@loft-enterprise/icons"

type IconButtonStyles = {
  appearance?: "primary" | "secondary" | "ghost"
}

type IconButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: React.ReactNode
  asChild?: boolean
  loading?: boolean
  size?: "default" | "large" | "small"
  shape?: "round" | "square"
} & IconButtonStyles

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      className,
      asChild = false,
      appearance = "primary",
      size = "default",
      loading,
      shape = "round",
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button"

    return (
      <Comp
        data-loading={loading}
        className={cx(
          "ring-offset-background border-1 inline-flex w-fit cursor-pointer items-center justify-center gap-2 whitespace-nowrap    border-transparent text-base transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-offset-2 disabled:pointer-events-none data-[loading=true]:pointer-events-none",
          {
            "p-2": size === "default",
            "p-1 [&_svg]:size-3": size === "small",
            "p-2.5": size === "large",

            rounded: shape === "square",
            "rounded-[100px]": shape === "round",
            "bg-primary-main text-white active:bg-primary-dark disabled:bg-disabled-main disabled:text-disabledColor-light data-[loading=true]:bg-primary-light data-[loading=true]:text-white hocus:bg-primary-light":
              appearance === "primary",

            "bg-transparent text-primary active:bg-neutral-light active:text-primaryColor-dark disabled:text-disabledColor-main hocus:bg-neutral-extra-light":
              appearance === "ghost",

            "bg-neutral-extra-light text-neutral-dark active:bg-neutral-light active:text-primaryColor-dark disabled:bg-disabled-main disabled:text-disabledColor-light data-[loading=true]:bg-primary-main hocus:text-black":
              appearance === "secondary",
          },
          className
        )}
        ref={ref}
        {...props}>
        {loading && <LoadingOutlined className="animate-spin *:size-4" />}
        {!loading && props.children}
      </Comp>
    )
  }
)
IconButton.displayName = "IconButton"

export { IconButton }
