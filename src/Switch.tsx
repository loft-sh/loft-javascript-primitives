import CheckOutlined from "@ant-design/icons/CheckOutlined"
import CloseOutlined from "@ant-design/icons/CloseOutlined"
import LoadingOutlined from "@ant-design/icons/LoadingOutlined"
import * as SwitchPrimitives from "@radix-ui/react-switch"
import * as React from "react"

import { cx } from "../clsx"
import { Label } from "./Label"

type TSwitchProps = React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> & {
  size?: "small" | "default"
  loading?: boolean
  showCheckedIcon?: boolean
  children?: React.ReactNode
}

const Switch = React.forwardRef<React.ElementRef<typeof SwitchPrimitives.Root>, TSwitchProps>(
  (
    {
      className,
      size = "default",
      loading = false,
      showCheckedIcon = false,
      children,
      id,
      ...props
    },
    ref
  ) => {
    const uniqueId = React.useId()
    const htmlFor = id ?? uniqueId

    return (
      <div className="flex flex-row items-center gap-2">
        <SwitchPrimitives.Root
          data-id={htmlFor}
          checked={props.checked ?? false}
          className={cx(
            `focus-visible:ring-ring focus-visible:ring-offset-background group/switch peer relative inline-flex shrink-0 cursor-pointer items-center rounded-full border-0 transition-colors focus-visible:outline-none focus-visible:ring-2  focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`,
            "aria-[checked=false]:bg-neutral-main",
            {
              "h-6 w-11": size === "default",
              "h-4 w-7": size === "small",
              "aria-[checked=false]:bg-disabled-main aria-[checked=true]:bg-primary-light": loading,
              "aria-[checked=true]:bg-primary-main": !loading,
            },
            className
          )}
          {...props}
          id={uniqueId}
          ref={ref}>
          {showCheckedIcon && (
            <CheckOutlined
              className={cx(
                "absolute left-1 transition-opacity *:fill-white group-aria-[checked=false]/switch:opacity-0",
                {
                  "*:size-3": size === "default",
                  "*:size-2 ": size === "small",
                }
              )}
            />
          )}
          <SwitchPrimitives.Thumb
            className={cx(
              "pointer-events-none relative block rounded-full bg-primary-contrast shadow-lg ring-0 transition-transform group-active/switch:scale-x-125 group-active/switch:delay-75",
              "data-[state=checked]:origin-right data-[state=unchecked]:origin-left data-[state=checked]:translate-x-[107%] data-[state=unchecked]:translate-x-[1.5px]",
              {
                "h-3 w-3 data-[state=checked]:translate-x-2": size === "small",
                "h-5 w-5 data-[state=checked]:translate-x-4": size === "default",
                "data-[state=checked]:text-blue-40 data-[state=unchecked]:text-gray-50": loading,
              }
            )}>
            {loading && (
              <LoadingOutlined
                className={cx("text-primary-main absolute inset-0 m-auto animate-spin", {
                  "*:size-2": size === "small",
                  "*:size-4": size === "default",
                })}
              />
            )}
          </SwitchPrimitives.Thumb>
          {showCheckedIcon && (
            <CloseOutlined
              className={cx(
                "absolute right-1 transition-opacity *:fill-white group-aria-[checked=true]/switch:opacity-0",
                {
                  "*:size-3": size === "default",
                  "*:size-2 ": size === "small",
                }
              )}
            />
          )}
        </SwitchPrimitives.Root>
        <Label htmlFor={uniqueId} className="flex flex-row p-0">
          {children}
        </Label>
      </div>
    )
  }
)
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
