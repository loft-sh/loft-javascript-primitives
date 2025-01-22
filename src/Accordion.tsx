import DownOutlined from "@ant-design/icons/DownOutlined"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import * as React from "react"

import cn from "../clsx"

const Accordion = AccordionPrimitive.Root

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item ref={ref} className={cn("group/accordion", className)} {...props} />
))
AccordionItem.displayName = "AccordionItem"

type TAccordionTriggerProps = React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger> & {
  customTrigger?: React.ReactNode
}

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  TAccordionTriggerProps
>(({ className, children, customTrigger, ...props }, ref) => (
  <AccordionPrimitive.Trigger
    ref={ref}
    className={cn(
      "group/accordion flex cursor-pointer items-center justify-between bg-transparent p-2 transition-all [&[aria-expanded=true]>svg]:rotate-180",
      className
    )}
    {...props}>
    {children}
    {customTrigger ?? (
      <DownOutlined
        className="transition-transform 
        duration-200 ease-in-out *:size-3 group-aria-[expanded=true]/accordion:rotate-180"
      />
    )}
  </AccordionPrimitive.Trigger>
))
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="w-full overflow-hidden transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}>
    <div className={cn("", className)}>{children}</div>
  </AccordionPrimitive.Content>
))
AccordionContent.displayName = AccordionPrimitive.Content.displayName

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
