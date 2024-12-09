import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { GroupBase, MultiValue, SetValueAction } from "react-select"

import { cn, cx } from "../../clsx"
import { Checkbox } from "../Checkbox"
import { Select } from "./Select"
import { SelectEmptyState } from "./SelectEmptyState"
import {
  MultipleTextSelectOptionExtraArgs,
  TSelectMenuListProps,
  TSelectMultiValueContainerProps,
  TSelectOptionProps,
  TSelectOptionType,
  TSelectPlaceholderProps,
  TSelectProps,
} from "./types"

export type MultipleSelectOptionType = TSelectOptionType<MultipleTextSelectOptionExtraArgs>

type BaseMultipleTextSelectProps = TSelectProps<MultipleSelectOptionType, true> & {
  showClearIndicator?: boolean
}

type MultipleTextSelectProps = BaseMultipleTextSelectProps & {
  valueContainerVariant?: "summary" | "commaSeparated"
  kind?: string
  showSelectAllCheckbox?: boolean
  allowClearSelection?: boolean
  requireSelection?: boolean
}

const MultipleTextSelect = ({
  onCreateOption,
  onChange,
  options,
  value,
  inputPrefix,
  placeholder,
  showClearIndicator,
  valueContainerVariant = "commaSeparated",
  kind,
  showSelectAllCheckbox = false,
  allowClearSelection = false,
  requireSelection = false,
}: MultipleTextSelectProps): React.ReactElement => {
  return (
    <Select
      isMulti
      options={options}
      value={value}
      onChange={onChange as (newValue: TSelectOptionType | TSelectOptionType[] | null) => void}
      onCreateOption={onCreateOption}
      components={{
        ValueContainer: (props: any) => (
          <ValueContainer
            {...props}
            inputPrefix={inputPrefix}
            valueContainerVariant={valueContainerVariant}
            kind={kind}
          />
        ),
        MultiValue: () => null,
        Input: () => <span className="py-4"></span>,
        // @ts-ignore
        MenuList: (props: MenuListProps) => (
          <MenuList
            {...props}
            showSelectAllCheckbox={showSelectAllCheckbox}
            allowClearSelection={allowClearSelection}
            requireSelection={requireSelection}
          />
        ),
        Placeholder: (props: any) => (
          <Placeholder {...props} inputPrefix={inputPrefix} placeholder={placeholder} />
        ),
        ...(!showClearIndicator && { ClearIndicator: () => null }),
        Option: (props: any) => <SelectOption {...props} requireSelection={requireSelection} />,
      }}
      closeMenuOnSelect={false}
    />
  )
}

type BaseValueContainerProps = TSelectMultiValueContainerProps<MultipleSelectOptionType, true> & {
  inputPrefix?: React.ReactElement
}

type ValueContainerProps = BaseValueContainerProps & {
  valueContainerVariant?: "summary" | "commaSeparated"
  kind?: string
}

const ValueContainer = ({
  children,
  getValue,
  selectProps: { onMenuOpen },
  inputPrefix,
  valueContainerVariant,
  kind,
}: ValueContainerProps): React.ReactElement => {
  const options = getValue()

  const label = useMemo(() => {
    if (valueContainerVariant === "summary") {
      if (options.length === 0) {
        return `All ${kind}`
      }

      return `${options.length} ${kind} selected`
    }

    if (valueContainerVariant === "commaSeparated") {
      if (options.length > 0 && options[0]) {
        return `${options.length === 1 ? options[0].label : `${options[0].label} + ${options.length - 1} more`}`
      }
    }

    return ""
  }, [valueContainerVariant, options, kind])

  return (
    <div
      onClick={onMenuOpen}
      className="value-container flex w-full select-none items-center gap-1.5 pl-3 text-sm text-tertiary">
      {inputPrefix}
      <span className="value-container-label w-[80px] truncate md:w-[120px]">{label}</span>
      <span className="py-4">{children}</span>
    </div>
  )
}

const SelectOption = <OptionType extends MultipleSelectOptionType>(
  props: TSelectOptionProps<OptionType, true> & { requireSelection?: boolean }
): React.ReactElement => {
  const { innerRef, innerProps, children, isFocused, isSelected, requireSelection } = props
  const selectedOptions = props.getValue()

  const isLastSelected = requireSelection && selectedOptions.length === 1 && isSelected
  const isClickable = !isLastSelected

  console.log(isLastSelected, requireSelection)

  const bgStyles = {
    "bg-neutral-light": isFocused,
    "bg-neutral-extra-light": isSelected,
  }

  return (
    <div
      {...innerProps}
      onClick={(e) => {
        if (!isLastSelected) {
          innerProps.onClick?.(e)
        }
      }}
      className={cx(
        "flex w-full select-none flex-row items-center text-sm text-primary",
        bgStyles,
        isClickable ? "cursor-pointer" : "cursor-default"
      )}>
      {props.data.extraArgs?.displayCheckbox ? (
        <Checkbox
          tabIndex={-1}
          checked={isSelected}
          disabled={isLastSelected}
          className={cx("pointer-events-none ml-3", {
            "opacity-50": isLastSelected,
          })}
        />
      ) : undefined}
      <div
        ref={innerRef}
        className={cx(`flex flex-grow flex-row items-center justify-between px-3 py-2`)}>
        {children}
      </div>
    </div>
  )
}

type MenuListProps = TSelectMenuListProps<
  MultipleSelectOptionType,
  true,
  GroupBase<MultipleSelectOptionType>
> & {
  showSelectAllCheckbox?: boolean
  allowClearSelection?: boolean
  requireSelection?: boolean
}

function MenuList<OptionType extends MultipleSelectOptionType>(
  props: MenuListProps
): React.ReactElement {
  const { selectOption } = props as unknown as {
    selectOption: (newValue: TSelectOptionType) => void
  }

  const options = props.options as OptionType[]
  const [focusedIndex, setFocusedIndex] = useState<number>(-1)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (menuRef.current) {
      menuRef.current.focus()
    }
  }, [])

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault()
        setFocusedIndex((prevIndex) => (prevIndex + 1) % options.length)
        break
      case "ArrowUp":
        event.preventDefault()
        setFocusedIndex((prevIndex) => (prevIndex - 1 + options.length) % options.length)
        break
      case "Enter":
        event.preventDefault()
        if (focusedIndex !== -1) {
          const selectedOption = options[focusedIndex]
          if (selectedOption) {
            selectOption(selectedOption)
          }
        }
        break
    }
  }

  return (
    <div
      ref={menuRef}
      {...props.innerProps}
      className={cn("border-gray-300 rounded-md border bg-white shadow-lg focus:outline-none", {
        "cursor-auto": !options.length,
      })}
      tabIndex={-1}
      onKeyDown={handleKeyDown}>
      {!options.length && <SelectEmptyState />}
      {props.showSelectAllCheckbox && (
        <SelectAllCheckbox
          options={options}
          getValue={props.getValue}
          setValue={props.setValue as any}
          allowClearSelection={props.allowClearSelection}
        />
      )}

      {options.map((option, index) => (
        <SelectOption
          key={option.value}
          {...props}
          requireSelection={props.requireSelection}
          label={option.label}
          type="option"
          isDisabled={false}
          isFocused={index === focusedIndex}
          data={option}
          isSelected={props.getValue().some((value) => value.value === option.value)}
          selectProps={props.selectProps}
          innerRef={() => {}}
          innerProps={{
            onClick: () => selectOption(option),
            onMouseEnter: () => setFocusedIndex(index),
          }}>
          <div>{option.label}</div>
        </SelectOption>
      ))}
    </div>
  )
}

interface OptionType {
  value: string
  label: string
}

interface SelectAllCheckboxProps {
  options: MultipleSelectOptionType[]
  getValue: () => MultiValue<TSelectOptionType>
  setValue: (
    newValue: MultiValue<TSelectOptionType>,
    action: SetValueAction,
    option?: TSelectOptionType | undefined
  ) => void
  allowClearSelection?: boolean
}

const SelectAllCheckbox = ({
  options,
  getValue,
  setValue,
  allowClearSelection = false,
}: SelectAllCheckboxProps) => {
  const currentValue = getValue()

  const selectedCount = useMemo(() => {
    return options.filter((option) => currentValue.some((value) => value.value === option.value))
      .length
  }, [options, currentValue])

  const handleChange = useCallback(() => {
    if (!allowClearSelection || selectedCount < options.length) {
      const allOptions = options.map((option) => ({
        value: option.value,
        label: option.label,
      }))
      setValue(allOptions as MultiValue<OptionType>, "select-option", undefined)
    }
  }, [selectedCount, options, setValue, allowClearSelection])

  const buttonText = useMemo(() => {
    if (selectedCount === options.length) {
      return allowClearSelection ? "Clear Selection" : "All Selected"
    }

    return "Select All"
  }, [selectedCount, options.length, allowClearSelection])

  const buttonEnabled = allowClearSelection || selectedCount < options.length

  return (
    <div className="flex cursor-pointer items-center gap-3 border-b border-divider-main px-3 py-2">
      <button
        onClick={handleChange}
        disabled={!buttonEnabled}
        className={cn(
          "text-sm font-medium",
          buttonEnabled ? "hover:text-primary-dark text-primary" : "cursor-default text-tertiary"
        )}
        type="button">
        {buttonText}
      </button>
    </div>
  )
}

const Placeholder = <OptionType extends MultipleSelectOptionType>({
  inputPrefix,
  placeholder,
}: TSelectPlaceholderProps<OptionType, true, GroupBase<OptionType>> & {
  inputPrefix?: React.ReactNode
  placeholder?: string
}): React.ReactElement => {
  const hasPrefix = !!inputPrefix

  return (
    <div
      className={cx(
        "pointer-events-none absolute top-1/2 -translate-y-1/2 select-none text-sm text-tertiary",
        {
          "left-3": !hasPrefix,
          "left-[32px]": hasPrefix,
        }
      )}>
      {placeholder}
    </div>
  )
}

export { MultipleTextSelect }
