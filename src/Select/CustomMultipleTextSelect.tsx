import React, { useEffect, useRef, useState } from "react"
import { GroupBase, MultiValue, SetValueAction } from "react-select"

import { cx } from "../../clsx"
import { Checkbox } from "../Checkbox"
import { Select } from "./Select"
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

const MultipleTextSelect = <OptionType extends MultipleSelectOptionType>({
  onCreateOption,
  onChange,
  options,
  value,
  inputPrefix,
  placeholder,
  showClearIndicator,
}: TSelectProps<OptionType, true> & {
  showClearIndicator?: boolean
}): React.ReactElement => {
  return (
    <Select
      isMulti
      options={options}
      value={value}
      onChange={onChange as (newValue: TSelectOptionType | TSelectOptionType[] | null) => void}
      onCreateOption={onCreateOption}
      components={{
        ValueContainer: (props: any) => <ValueContainer {...props} inputPrefix={inputPrefix} />,
        MultiValue: () => null,
        Input: () => <span className="py-4"></span>,
        MenuList: MenuList,
        Placeholder: (props: any) => (
          <Placeholder {...props} inputPrefix={inputPrefix} placeholder={placeholder} />
        ),
        ...(!showClearIndicator && { ClearIndicator: () => null }),
      }}
      closeMenuOnSelect={false}
    />
  )
}

const ValueContainer = ({
  children,
  getValue,
  selectProps: { onMenuOpen },
  inputPrefix,
}: TSelectMultiValueContainerProps<MultipleSelectOptionType, true> & {
  inputPrefix?: React.ReactElement
}) => {
  const options = getValue()
  let label = ""

  if (options.length > 0 && options[0]) {
    label =
      options.length === 1 ? options[0].label : `${options[0].label} + ${options.length - 1} more`
  }

  return (
    <div
      onClick={onMenuOpen}
      className="value-container flex w-full select-none items-center gap-1.5 pl-3 text-sm text-tertiary">
      {inputPrefix}
      <span className="w-[80px] truncate md:w-[120px]">{label}</span>
      <span className="py-4">{children}</span>
    </div>
  )
}

const SelectOption = <OptionType extends MultipleSelectOptionType>(
  props: TSelectOptionProps<OptionType, true>
): React.ReactElement => {
  const { innerRef, innerProps, children, isFocused, isSelected } = props

  const bgStyles = {
    "bg-neutral-light": isFocused,
    "bg-neutral-extra-light": isSelected,
  }

  return (
    <div
      {...innerProps}
      className={cx(
        "flex w-full cursor-pointer select-none flex-row items-center text-sm text-primary",
        bgStyles
      )}>
      {props.data.extraArgs?.displayCheckbox ? (
        <Checkbox
          tabIndex={-1}
          checked={isSelected}
          className={"pointer-events-none ml-3"}></Checkbox>
      ) : undefined}
      <div
        ref={innerRef}
        className={cx(`flex flex-grow flex-row items-center justify-between px-3 py-2`)}>
        {children}
      </div>
    </div>
  )
}

function MenuList<OptionType extends MultipleSelectOptionType>(
  props: TSelectMenuListProps<OptionType, true, GroupBase<OptionType>>
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
      className="border-gray-300 rounded-md border bg-white shadow-lg focus:outline-none"
      tabIndex={-1}
      onKeyDown={handleKeyDown}>
      {options.map((option, index) => (
        <SelectOption
          key={option.value}
          label={option.label}
          type="option"
          isDisabled={false}
          isFocused={index === focusedIndex}
          clearValue={props.clearValue}
          cx={props.cx}
          getStyles={props.getStyles}
          getClassNames={props.getClassNames}
          getValue={props.getValue}
          hasValue={props.hasValue}
          isMulti={props.isMulti}
          isRtl={props.isRtl}
          options={props.options}
          selectOption={selectOption}
          setValue={
            props.setValue as (
              newValue: MultiValue<TSelectOptionType>,
              action: SetValueAction,
              option?: TSelectOptionType
            ) => void
          }
          theme={props.theme}
          innerRef={() => {}}
          innerProps={{
            onClick: () => selectOption(option),
            onMouseEnter: () => setFocusedIndex(index),
          }}
          data={option}
          isSelected={props.getValue().some((value) => value.value === option.value)}
          selectProps={props.selectProps}>
          <div>{option.label}</div>
        </SelectOption>
      ))}
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
