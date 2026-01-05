import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import * as React from "react"
import { useId } from "react"

import { cx } from "../clsx"
import { Label } from "./Label"

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return <RadioGroupPrimitive.Root className={cx("grid gap-2", className)} {...props} ref={ref} />
})
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cx(
        "ring-offset-background focus-visible:ring-ring peer aspect-square h-4 w-4 rounded-full border border-divider-main bg-white text-primary hover:border-neutral-light focus:border-neutral-light focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:border-disabled-main disabled:text-disabledColor-main disabled:opacity-50 checked:border-neutral-main",
        className
      )}
      {...props}>
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <div className="aspect-square size-2.5 rounded-full bg-neutral-main"></div>
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
})
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

function LabeledRadioGroupItem({
  label,
  ...props
}: React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> & {
  label: React.ReactNode
}) {
  const id = useId()

  return (
    <>
      <RadioGroupItem id={id} {...props} />
      <Label
        className="flex cursor-pointer flex-row items-center p-0 text-sm text-secondary"
        htmlFor={id}>
        {label}
      </Label>
    </>
  )
}

export { RadioGroup, RadioGroupItem, LabeledRadioGroupItem }
