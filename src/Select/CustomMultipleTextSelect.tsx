import React, { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { GroupBase, MultiValue, SetValueAction } from "react-select"

import { cn, cx } from "../../clsx"
import { Checkbox } from "../Checkbox"
import { Input } from "../Input"
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
import { SearchOutlined } from "@loft-enterprise/icons"
import { wrapNumber } from "@loft-enterprise/shared"

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
  searchable?: boolean
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
  searchable = false,
}: MultipleTextSelectProps): React.ReactElement => {
  const memoizedMenuList = useMemo(
    // eslint-disable-next-line react/display-name
    () => (props: MenuListProps) => (
      <MenuList
        {...props}
        showSelectAllCheckbox={showSelectAllCheckbox}
        allowClearSelection={allowClearSelection}
        searchable={searchable}
        requireSelection={requireSelection}
      />
    ),
    [searchable, allowClearSelection, requireSelection, showSelectAllCheckbox]
  )

  const memoizedComponents = useMemo(
    () => ({
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
      MenuList: memoizedMenuList,
      Placeholder: (props: any) => (
        <Placeholder {...props} inputPrefix={inputPrefix} placeholder={placeholder} />
      ),
      ...(!showClearIndicator && { ClearIndicator: () => null }),
      Option: (props: any) => <SelectOption {...props} requireSelection={requireSelection} />,
    }),
    [
      requireSelection,
      showClearIndicator,
      inputPrefix,
      placeholder,
      kind,
      valueContainerVariant,
      memoizedMenuList,
    ]
  )

  return (
    <Select
      isMulti
      options={options}
      value={value}
      onChange={onChange as (newValue: TSelectOptionType | TSelectOptionType[] | null) => void}
      onCreateOption={onCreateOption}
      components={memoizedComponents}
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
  props: Omit<TSelectOptionProps<OptionType, boolean>, "isFocused"> & {
    requireSelection?: boolean
    focusRequested?: boolean
    resetFocusRequested?: () => void
  }
): React.ReactElement => {
  const {
    innerRef,
    innerProps,
    children,
    isSelected,
    requireSelection,
    focusRequested,
    resetFocusRequested,
  } = props
  const selectedOptions = props.getValue()

  const isLastSelected = requireSelection && selectedOptions.length === 1 && isSelected
  const isClickable = !isLastSelected

  const bgStyles = {
    "bg-neutral-extra-light": !props.data.extraArgs?.displayCheckbox && isSelected,
  }

  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (focusRequested) {
      containerRef.current?.focus()
      resetFocusRequested?.()
    }
  }, [focusRequested, resetFocusRequested])

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      {...innerProps}
      onClick={(e) => {
        if (!isLastSelected) {
          innerProps.onClick?.(e)
        }
      }}
      className={cx(
        "flex w-full select-none flex-row items-center text-sm text-primary focus-within:bg-neutral-light focus-within:outline-none",
        isClickable ? "cursor-pointer" : "cursor-default",
        bgStyles
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
  boolean,
  GroupBase<MultipleSelectOptionType>
> & {
  showSelectAllCheckbox?: boolean
  allowClearSelection?: boolean
  requireSelection?: boolean
  searchable?: boolean
}

function MenuList<OptionType extends MultipleSelectOptionType>(
  props: MenuListProps
): React.ReactElement {
  const height = 308 // 7 * 44px per option

  const { selectOption } = props as unknown as {
    selectOption: (newValue: TSelectOptionType) => void
  }

  const [searchString, setSearchString] = useState<string | undefined>(undefined)

  const options = props.options as OptionType[]
  const [focusRequested, setFocusRequested] = useState<number>(-1)
  const menuRef = useRef<HTMLDivElement>(null)

  const resetFocusRequested = useCallback(() => {
    setFocusRequested(-1)
  }, [setFocusRequested])

  // Reset autofocus when the filter changes.
  useEffect(() => {
    resetFocusRequested()
  }, [searchString, resetFocusRequested])

  // Apply search & map the data by its original index in the underlying full array.
  const filteredOptions = useMemo(() => {
    const indexMapped = options.map((data, id) => ({ data, id }))
    if (!props.searchable || !searchString) {
      return indexMapped
    }

    return indexMapped.filter((op) =>
      op.data.label.toLowerCase().includes(searchString.toLowerCase())
    )
  }, [options, searchString, props.searchable])

  useEffect(() => {
    if (menuRef.current) {
      menuRef.current.focus()
    }
  }, [])

  const handleListKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    switch (event.key) {
      // Something else deep down is listening to the tab and messing with the tab order.
      // For better accessibility, we disrupt this disruption.
      case "Tab": {
        event.stopPropagation()
        break
      }
    }
  }

  const handleItemKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>,
    option: MultipleSelectOptionType,
    filteredIndex: number
  ) => {
    switch (event.code) {
      case "ArrowDown":
        event.preventDefault()
        setFocusRequested(wrapNumber(filteredIndex + 1, filteredOptions.length))
        break
      case "ArrowUp":
        event.preventDefault()
        setFocusRequested(wrapNumber(filteredIndex - 1, filteredOptions.length))
        break
      case "Space":
      case "Enter":
        event.stopPropagation()
        event.preventDefault()
        selectOption(option)
        break
    }
  }

  const stopPropagation = useCallback((e: { stopPropagation: () => void }) => {
    e.stopPropagation()
  }, [])

  const searchInputRef = useRef<HTMLInputElement | null>(null)

  const focusInput = useCallback(() => {
    searchInputRef.current?.focus()
  }, [])

  const changeSearchString = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setSearchString(e.target.value ? e.target.value : undefined)
    },
    [setSearchString]
  )

  return (
    <div
      ref={menuRef}
      {...props.innerProps}
      className={cn("border-gray-300 rounded-md border bg-white shadow-lg focus:outline-none", {
        "cursor-auto": !options.length,
      })}
      tabIndex={-1}
      onKeyDown={handleListKeyDown}>
      {props.showSelectAllCheckbox && (
        <SelectAllCheckbox
          options={options}
          getValue={props.getValue}
          setValue={props.setValue as any}
          allowClearSelection={props.allowClearSelection}
        />
      )}
      {props.searchable && (
        <div
          className={
            "box-border flex w-full flex-row items-center border-b border-divider-main p-2 "
          }>
          <Input
            ref={searchInputRef}
            value={searchString ?? ""}
            preffix={<SearchOutlined className={"!cursor-text"} onClick={focusInput} />}
            prefixClassName={"pointer-events-auto"}
            onMouseDown={stopPropagation}
            onKeyDown={stopPropagation}
            onChange={changeSearchString}
            inputClassName={"pl-0.5"}
            placeholder={"Search..."}
            type={"text"}
            spellCheck={false}
          />
        </div>
      )}
      {!filteredOptions.length && <SelectEmptyState />}
      <div style={{ maxHeight: `${height}px` }} className={"flex w-full flex-col overflow-y-auto"}>
        {filteredOptions.map((option, index) => (
          <SelectOption
            key={option.data.value}
            {...props}
            requireSelection={props.requireSelection}
            label={option.data.label}
            type="option"
            isDisabled={false}
            focusRequested={index === focusRequested}
            data={option.data}
            isSelected={props.getValue().some((value) => value.value === option.data.value)}
            selectProps={props.selectProps}
            innerRef={() => {}}
            innerProps={{
              onClick: () => selectOption(option.data),
              onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) =>
                handleItemKeyDown(e, option.data, index),
            }}>
            <div>{option.data.label}</div>
          </SelectOption>
        ))}
      </div>
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
