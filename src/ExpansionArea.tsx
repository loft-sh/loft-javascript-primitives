import React from "react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  cn,
} from "@loft-enterprise/primitives"

type Props = {
  children?: React.ReactNode
  className?: string
  title: string | React.ReactNode
  value: string
  isChild?: boolean
  size?: "default" | "large"
  description?: string | React.ReactNode
  open?: boolean
  variant?: "default" | "descriptive"
}

function ExpansionArea({
  children,
  title,
  isChild,
  className,
  description,
  value,
  size = "default",
  open = false,
  variant = "default",
}: Props) {
  return (
    <Accordion
      className={cn("w-full", className)}
      type="single"
      collapsible
      defaultValue={open ? value : undefined}>
      <AccordionItem
        value={value}
        className={cn("flex w-full flex-col rounded-md bg-gray-5 [&_h3]:!mb-0", {
          "border-none": isChild,
          "border border-divider-light": !isChild,
          "bg-transparent": variant === "descriptive",
        })}>
        <AccordionTrigger
          className={cn("flex w-full items-center gap-2", {
            "text-sm": size === "default",
            "text-base": size === "large",
            "flex-row-reverse justify-end": variant === "default",
            "flex-row justify-between": variant === "descriptive",
          })}>
          <div
            className={cn("flex flex-col items-start gap-2 self-start", {
              block: variant === "default",
            })}>
            <span
              className={cn("", {
                "flex flex-col gap-2 text-sm font-medium text-primary": variant === "descriptive",
              })}>
              {title}
            </span>
            {variant === "descriptive" && description && (
              <span className="text-left text-xs text-tertiary">{description}</span>
            )}
          </div>
        </AccordionTrigger>
        <AccordionContent
          className={cn("pb-4", {
            "px-0": isChild,
            "px-2": !isChild,
          })}>
          {children}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

export { ExpansionArea }
