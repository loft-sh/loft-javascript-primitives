import React, { useId, type ReactNode } from "react"

import { cn } from "../../cn-utils"
import { CheckOutlined } from "@loft-enterprise/icons"
import { IconComponentFunction } from "@loft-enterprise/shared"

export type OptionsPickerOption = {
  option: string
  label?: ReactNode
  icon?: IconComponentFunction
  suffix?: ReactNode
}

export type OptionsPickerProps = {
  options: OptionsPickerOption[]
  selectedOption?: string
  onSelect?: (option: string) => void
  "aria-label"?: string
  className?: string
}

export function OptionsPicker({
  options,
  selectedOption,
  onSelect,
  "aria-label": ariaLabel,
  className,
}: OptionsPickerProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)} role="listbox" aria-label={ariaLabel}>
      {options.map((item) => (
        <Item
          key={item.option}
          value={item.option}
          label={item.label ?? item.option}
          icon={item.icon}
          suffix={item.suffix}
          selected={selectedOption === item.option}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}

const Item = React.memo(function Item({
  value,
  label,
  icon: Icon,
  suffix,
  selected,
  onSelect,
}: {
  value: string
  label: ReactNode
  icon?: IconComponentFunction
  suffix?: ReactNode
  selected?: boolean
  onSelect?: (option: string) => void
}) {
  const id = useId()
  const labelId = `${id}-label`

  return (
    <div
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.stopPropagation()
          onSelect?.(value)
        }
      }}
      onClick={() => onSelect?.(value)}
      className={cn(
        "flex select-none flex-row items-center gap-4 rounded-md bg-white px-4 py-2",
        "focus-visible:outline focus-visible:outline-1 focus-visible:outline-neutral-dark",
        "overflow-hidden hover:border-neutral-dark",
        "cursor-pointer border border-divider-light transition-colors",
        {
          "border-neutral-dark bg-neutral-extra-light": selected,
        }
      )}
      role="option"
      aria-labelledby={labelId}
      aria-selected={selected}>
      <div className="flex shrink-0 flex-row items-center gap-2">
        {Icon && <Icon aria-hidden="true" className="size-4 *:size-4" />}
        <div id={labelId} className="flex-1 shrink-0 whitespace-nowrap">
          {label}
        </div>
      </div>

      <div className="ml-auto flex flex-row items-center gap-2 overflow-hidden">
        {suffix ? <div className="truncate text-tertiary">{suffix}</div> : null}
        <CheckOutlined
          aria-hidden="true"
          className={cn(
            "size-4 shrink-0 transition-opacity *:size-4",
            selected ? "opacity-100" : "opacity-0"
          )}
        />
      </div>
    </div>
  )
})
