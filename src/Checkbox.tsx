import CheckOutlined from "@ant-design/icons/CheckOutlined"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { CheckedState } from "@radix-ui/react-checkbox"
import * as React from "react"

import cn, { cx } from "../clsx"
import { Label } from "./Label"

type TCheckboxProps = React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> & {
  children?: React.ReactNode
  description?: React.ReactNode
  labelSize?: "sm" | "lg" | "xs"
}

export type { CheckedState }

const MaybeWrapper = ({ children, hasLabel }: { children: React.ReactNode; hasLabel: boolean }) => {
  return hasLabel ? (
    <div className="grid grid-cols-[auto,1fr] items-center gap-x-2">{children}</div>
  ) : (
    <>{children}</>
  )
}

const Checkbox = React.forwardRef<React.ElementRef<typeof CheckboxPrimitive.Root>, TCheckboxProps>(
  ({ className, children, description, labelSize = "sm", ...props }, ref) => {
    const id = React.useId()

    return (
      <MaybeWrapper hasLabel={!!children}>
        <CheckboxPrimitive.Root
          id={props.id || id}
          ref={ref}
          className={cx(
            "group peer h-4 w-4 shrink-0 rounded-sm border border-neutral-main bg-white ring-offset-background-light-40 transition-colors duration-200 ease-out enabled:text-white disabled:cursor-not-allowed disabled:opacity-50 aria-[checked=true]:bg-primary-main",
            "hover:border-primary-main disabled:hover:bg-none hover:aria-[checked=true]:bg-primary-dark",
            "cursor-pointer focus:border-primary-dark focus-visible:outline-none  focus-visible:ring-2 focus-visible:ring-primary-light focus-visible:ring-offset-2 focus-visible:ring-offset-white",
            "disabled:text-disabled-main  disabled:border-disabled-dark disabled:bg-disabled-light disabled:aria-[checked=true]:bg-disabled-main",
            className
          )}
          {...props}>
          <CheckboxPrimitive.Indicator
            forceMount
            className={cx(
              "relative flex items-center justify-center transition-opacity duration-200 ease-out data-[state=checked]:opacity-100 data-[state=indeterminate]:opacity-100 data-[state=unchecked]:opacity-0"
            )}>
            <CheckOutlined className="absolute *:size-[0.75rem] group-disabled:data-[state=checked]:fill-disabled-dark" />
            {props.checked === "indeterminate" && (
              <svg
                className="absolute size-2.5  group-focus-visible:fill-primary-dark group-enabled:fill-primary-main  group-disabled:data-[state=indeterminate]:fill-disabled-dark"
                viewBox="0 0 100 100"
                fill="currentColor">
                <rect x="3" y="7" width={100} height={100} rx="3" />
              </svg>
            )}
          </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>
        {children && (
          <Label
            className={cn("cursor-pointer pb-0 text-primary", {
              "text-sm": labelSize === "sm",
              "text-lg": labelSize === "lg",
              "text-xs": labelSize === "xs",
            })}
            htmlFor={props.id || id}>
            {children}
          </Label>
        )}
        {description && (
          <>
            <div>{/* empty cell */}</div>
            <div className={"text-xs text-tertiary"}>{description}</div>
          </>
        )}
      </MaybeWrapper>
    )
  }
)
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
