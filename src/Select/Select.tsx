/* eslint-disable react/display-name */
import React, { ComponentType, useCallback, useEffect, useMemo, useRef, useState } from "react"
import ReactSelect, {
  ClearIndicatorProps,
  ControlProps,
  GroupBase,
  InputProps,
  MultiValue,
  MultiValueProps,
  OnChangeValue,
  OptionProps,
  PlaceholderProps,
  SingleValueProps,
} from "react-select"
import CreatableSelect from "react-select/creatable"
import { SelectComponents } from "react-select/dist/declarations/src/components"

import cn, { cx } from "../../clsx"
import { Chip } from "../Chip"
import { ExtendedInput, ExtendedInputContainer, ExtendedInputPrefix } from "../ExtendedInput"
import { omitProps } from "../helpers"
import { Tooltip } from "../Tooltip"
import {
  TSelectContainerProps,
  TSelectControlProps,
  TSelectDropdownIndicatorProps,
  TSelectInputProps,
  TSelectMenuListProps,
  TSelectMultiValueContainerProps,
  TSelectMultiValueProps,
  TSelectMultiValueRemoveProps,
  TSelectOptionProps,
  TSelectOptionType,
  TSelectProps,
  TSelectSingleValueProps,
} from "./index"
import { CloseCircleFilled, CloseOutlined, DownOutlined } from "@loft-enterprise/icons"

/**
 *
 * Wrapper for the select container. Contains the value, input, and dropdown indicator
 * @returns {React.ReactNode}
 */
function SelectContainer<
  OptionType extends TSelectOptionType,
  IsMulti extends boolean = false,
  Group extends GroupBase<OptionType> = GroupBase<OptionType>,
>({
  children,
  innerProps,
  isDisabled,
  error,
  variant,
}: TSelectContainerProps<OptionType, IsMulti, Group> & {
  variant?: SelectVariant
}): React.ReactElement {
  const memoizedErrorContent = useMemo(() => error?.content, [error?.content])
  const isPlain = variant === SelectVariant.PLAIN

  return (
    <div
      {...innerProps}
      className={cn("relative rounded pr-2", {
        "border border-divider-main bg-white": !isPlain,
        "bg-transparent text-secondary": isPlain,
        "cursor-not-allowed": isDisabled,
        "cursor-pointer": !isDisabled,
        "border-danger-main": memoizedErrorContent,
      })}>
      {children}
      {memoizedErrorContent && (
        <Tooltip richTooltip className="z-[9999999] max-w-lg" content={memoizedErrorContent}>
          <CloseCircleFilled
            className={cn("absolute right-2 top-1/2 size-4 -translate-y-1/2 text-danger-main", {
              "bg-white": !isPlain,
              "bg-transparent": isPlain,
            })}
          />
        </Tooltip>
      )}
    </div>
  )
}

/**
 *
 * Wrapper for the select input. Contains the input and input prefix
 * @returns {React.ReactNode}
 */
const SelectInput = <IsMulti extends boolean>({
  innerRef,
  isDisabled,
  value,
  inputPrefix,
  ...props
}: TSelectInputProps<IsMulti>): React.ReactElement => {
  const rest = omitProps(props, [
    "clearValue",
    "cx",
    "getStyles",
    "getClassNames",
    "getValue",
    "hasValue",
    "isHidden",
    "isMulti",
    "isRtl",
    "options",
    "selectProps",
    "selectOption",
    "setValue",
    "theme",
  ])

  return (
    <ExtendedInputContainer>
      {inputPrefix && <ExtendedInputPrefix>{inputPrefix}</ExtendedInputPrefix>}
      <ExtendedInput
        type="text"
        {...rest}
        ref={innerRef}
        className={` ${isDisabled ? "bg-gray-200" : "bg-white"}`}
        disabled={isDisabled}
        value={value}
      />
    </ExtendedInputContainer>
  )
}

/**
 *
 * Displays the currently selected value when the select is not multi-value.
 * @returns {React.ReactNode}
 */
const SelectSingleValue = <OptionType extends TSelectOptionType, IsMulti extends boolean>({
  children,
  hasPrefix,
  data,
  variant,
}: TSelectSingleValueProps<OptionType, IsMulti> & {
  variant?: SelectVariant
}): React.ReactElement => {
  const isPlain = variant === SelectVariant.PLAIN

  return (
    <div
      className={cx(
        "pointer-events-none flex select-none items-center text-sm data-[selected=true]:bg-primary-main",
        {
          "absolute top-1/2 w-[85%] -translate-y-1/2 justify-between": !isPlain,
          "left-[30px]": !isPlain && hasPrefix,
          "left-3": !isPlain && !hasPrefix,
        }
      )}>
      <div
        className={cx("whitespace-nowrap", {
          "truncate text-ellipsis": !isPlain,
          "w-full": !hasPrefix,
          "w-[70%]": hasPrefix || data.extraArgs?.suffix || data.extraArgs?.tag,
        })}>
        {children}
      </div>
      <div className="ml-2 flex items-center gap-2">
        {data.extraArgs?.suffix}
        {data.extraArgs?.tag}
      </div>
    </div>
  )
}
/**
 *
 * Displays the selected value when the select is multi-value.
 * @returns {React.ReactNode}
 */
const SelectMultiValue = <IsMulti extends boolean>({
  data,
  removeProps,
}: TSelectMultiValueProps<TSelectOptionType, IsMulti> & {
  removeProps: TSelectMultiValueRemoveProps<TSelectOptionType, IsMulti>["innerProps"]
}): React.ReactElement => {
  return (
    <Chip>
      <div className="px-2">{data.label}</div>
      <div {...removeProps} className="cursor-pointer px-1">
        ✕
      </div>
    </Chip>
  )
}

/**
 *
 * Container for multi-value select. Wraps the selected values.
 * @returns {React.ReactNode}
 */
function SelectMultiValueContainer<
  OptionType extends TSelectOptionType,
  IsMulti extends boolean = true,
  Group extends GroupBase<OptionType> = GroupBase<OptionType>,
>(props: TSelectMultiValueContainerProps<OptionType, IsMulti, Group>): React.ReactElement {
  return <div className="flex flex-wrap gap-1.5">{props.children}</div>
}

/**
 *
 * Container for the dropdown indicator. Rotates the indicator based on the menu state.
 * @returns {React.ReactNode}
 */
function SelectDropdownIndicator<
  OptionType extends TSelectOptionType,
  IsMulti extends boolean = false,
  Group extends GroupBase<OptionType> = GroupBase<OptionType>,
>(props: TSelectDropdownIndicatorProps<OptionType, IsMulti, Group>): React.ReactElement {
  return (
    <DownOutlined
      className={cx("size-4 rotate-0 opacity-50 transition-all", {
        "rotate-180": props.selectProps.menuIsOpen,
      })}
    />
  )
}

/**
 *
 * Container for the dropdown list of options. Provides scrolling and boundary constraints.
 * @returns {React.ReactNode}
 */
function SelectMenuList<
  OptionType extends TSelectOptionType,
  IsMulti extends boolean = false,
  Group extends GroupBase<OptionType> = GroupBase<OptionType>,
>(props: TSelectMenuListProps<OptionType, IsMulti, Group>): React.ReactElement {
  const height = props.options.length < 7 ? props.options.length * 44 : 156

  return (
    <div
      ref={props.innerRef}
      style={{ maxHeight: `${height}px` }}
      // if options are 1 item, set the height to fit the content
      className={`border-gray-300 select-menu-list mt-1 overflow-y-auto  rounded-md border bg-white shadow-lg`}>
      {props.children}
    </div>
  )
}

/**
 *
 * Component that renders each individual option within the dropdown menu.
 * @returns {React.ReactNode}
 */
const SelectOption = <OptionType extends TSelectOptionType, IsMulti extends boolean>(
  props: TSelectOptionProps<OptionType, IsMulti> & {
    disabledOptionTooltipText?: string | undefined
  }
): React.ReactElement => {
  const { innerRef, innerProps, children, isFocused, data, isSelected } = props
  const isDisabled = data.extraArgs?.disabled
  const disabledMessage = data.extraArgs?.disabledMessage || props.disabledOptionTooltipText

  return (
    <Tooltip
      className={`${isDisabled ? "z-[9999999]" : ""} max-w-[40ch]`}
      content={isDisabled ? disabledMessage : ""}>
      <div
        ref={isDisabled ? undefined : innerRef}
        {...innerProps}
        onClick={isDisabled ? undefined : innerProps.onClick}
        className={cx(
          `flex items-center justify-between overflow-hidden whitespace-nowrap px-3 py-2 text-sm text-primary`,
          {
            "bg-neutral-extra-light": isFocused,
            "cursor-not-allowed text-tertiary": isDisabled,
            "cursor-pointer": !isDisabled,
            "bg-neutral-extra-light/40": isSelected,
          }
        )}>
        <div className="truncate">{children}</div>
        <span className="ml-2 flex flex-shrink-0 items-center gap-2">
          {data.extraArgs?.suffix}
          {data.extraArgs?.tag}
        </span>
      </div>
    </Tooltip>
  )
}

const SelectControl = <OptionType extends TSelectOptionType, IsMulti extends boolean>(
  props: TSelectControlProps<OptionType, IsMulti> & {
    isDisabled?: boolean | undefined
    inputPrefix?: React.ReactNode
  }
) => {
  const { children, inputPrefix, selectProps, isDisabled } = props
  const onClick = () => {
    selectProps.menuIsOpen ? selectProps.onMenuClose() : selectProps.onMenuOpen()
  }

  return (
    <div
      className={cx("flex justify-between", {
        "flex-row items-center gap-2": !!inputPrefix,
        "pointer-events-none cursor-not-allowed": isDisabled,
      })}
      onClick={onClick}
      ref={props.innerRef}>
      {inputPrefix ? inputPrefix : undefined}
      {children}
    </div>
  )
}

/**
 * Custom Placeholder component for the Select component.
 * @returns {React.ReactNode}
 */
const SelectPlaceholder = <OptionType extends TSelectOptionType, IsMulti extends boolean>({
  inputPrefix,
  selectProps,
  variant,
}: PlaceholderProps<OptionType, IsMulti, GroupBase<OptionType>> & {
  inputPrefix: React.ReactNode
  variant?: SelectVariant
}): React.ReactElement => {
  const hasPrefix = !!inputPrefix
  const { placeholder } = selectProps
  const isPlain = variant === SelectVariant.PLAIN

  return (
    <div
      className={cx("pointer-events-none select-none whitespace-nowrap text-sm text-tertiary", {
        "absolute top-1/2 max-w-[80%] -translate-y-1/2 truncate text-ellipsis": !isPlain,
        "left-3": !isPlain && !hasPrefix,
        "left-[40px]": !isPlain && hasPrefix,
      })}>
      {placeholder ? placeholder : "Select an option"}
    </div>
  )
}

enum SelectVariant {
  STANDARD = "STANDARD",
  PLAIN = "PLAIN",
}

/**
 *
 * Select component that allows single or multi-value selection.
 * It also allows for the creation of new options.
 *
 * @returns {React.ReactNode}
 */
const Select = React.memo(
  <OptionType extends TSelectOptionType, IsMulti extends boolean>({
    onCreateOption,
    onChange,
    options,
    value,
    isMulti = false as IsMulti,
    components,
    inputPrefix,
    closeMenuOnSelect,
    onBlur,
    isDisabled,
    disabledOptionTooltipText,
    placeholder,
    isClearable,
    variant = SelectVariant.STANDARD,
    ...props
  }: TSelectProps<OptionType, IsMulti> & { variant?: SelectVariant }): React.ReactElement => {
    const [internalValue, setInternalValue] = useState<
      TSelectOptionType | MultiValue<OptionType> | null
    >(null)

    useEffect(() => {
      if (typeof value === "string") {
        setInternalValue(value ? { label: value, value } : null)
      } else if (value && "value" in value) {
        setInternalValue(value as TSelectOptionType)
      } else if (value) {
        setInternalValue(value)
      } else {
        setInternalValue(null)
      }
    }, [value])

    const memoizedOptions = useMemo(() => options, [options])
    const [menuIsOpen, setMenuIsOpen] = React.useState(false)
    const selectRef = useRef<HTMLDivElement>(null)

    const error = useMemo(() => props.error, [props.error])

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
          setMenuIsOpen(false)
        }
      }

      document.addEventListener("mousedown", handleClickOutside)

      return () => {
        document.removeEventListener("mousedown", handleClickOutside)
      }
    }, [])
    const handleMenuOpen = useCallback(() => setMenuIsOpen(true), [])
    const handleMenuClose = useCallback(() => setMenuIsOpen(false), [])

    const handleCreate = useCallback(
      (inputValue: string) => {
        onCreateOption?.(inputValue)
      },
      [onCreateOption]
    )

    const handleChange = useCallback(
      (newValue: OnChangeValue<OptionType, IsMulti>) => {
        const processedValue = isMulti
          ? (newValue as OptionType[])
          : (newValue as OptionType | null)
        setInternalValue(processedValue as TSelectOptionType | null)
        onChange(processedValue as IsMulti extends true ? OptionType[] : OptionType | null)
      },
      [onChange, isMulti]
    )
    const SelectComponent = onCreateOption ? CreatableSelect : ReactSelect
    const InputComponent = React.useCallback(
      (props: InputProps<TSelectOptionType, IsMulti, GroupBase<TSelectOptionType>>) =>
        variant === SelectVariant.PLAIN ? undefined : (
          <SelectInput {...props} inputPrefix={inputPrefix} />
        ),
      [inputPrefix]
    )

    const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
      if (event.key === "Escape" && menuIsOpen) event.stopPropagation()
    }

    const hasPrefix = !!inputPrefix

    const memoizedContainer = useMemo(
      () => (props: TSelectContainerProps<OptionType, IsMulti>) => (
        <SelectContainer {...props} variant={variant} error={error} />
      ),
      [error, variant]
    )

    const memoizedComponents = useMemo(
      () => ({
        SelectContainer: memoizedContainer,
        Control: React.memo((props: ControlProps<OptionType, IsMulti>) => (
          <SelectControl
            {...props}
            inputPrefix={variant === SelectVariant.PLAIN ? inputPrefix : undefined}
            isDisabled={isDisabled}
          />
        )),
        Option: (props: OptionProps<OptionType, IsMulti, GroupBase<OptionType>>) => {
          return <SelectOption {...props} disabledOptionTooltipText={disabledOptionTooltipText} />
        },
        Input: InputComponent as unknown as ComponentType<
          InputProps<OptionType, IsMulti, GroupBase<OptionType>>
        >,
        MenuList: SelectMenuList,
        SingleValue: React.memo((props: SingleValueProps<OptionType, IsMulti>) => (
          <SelectSingleValue {...props} variant={variant} hasPrefix={hasPrefix} />
        )),
        Placeholder: React.memo((props: PlaceholderProps<OptionType, IsMulti>) => (
          <SelectPlaceholder {...props} inputPrefix={inputPrefix} variant={variant} />
        )),
        MultiValue: SelectMultiValue as unknown as ComponentType<
          MultiValueProps<OptionType, IsMulti, GroupBase<OptionType>>
        >,
        ValueContainer: SelectMultiValueContainer,
        NoOptionsMessage: () => null,
        DropdownIndicator: SelectDropdownIndicator,
        ClearIndicator: React.memo((props: ClearIndicatorProps<OptionType, IsMulti>) => (
          <div {...props.innerProps} className="cursor-pointer text-tertiary">
            <CloseOutlined />
          </div>
        )),
        ...components,
      }),
      [
        InputComponent,
        error,
        components,
        isDisabled,
        disabledOptionTooltipText,
        hasPrefix,
        inputPrefix,
        variant,
      ]
    ) as Partial<SelectComponents<OptionType, IsMulti, GroupBase<OptionType>>> | undefined

    return (
      <div className="w-full" ref={selectRef}>
        <SelectComponent
          isClearable={isClearable}
          isDisabled={isDisabled}
          isSearchable
          isMulti={isMulti}
          components={memoizedComponents}
          unstyled
          options={memoizedOptions}
          formatCreateLabel={(inputValue) => `${inputValue}`}
          onCreateOption={handleCreate}
          value={internalValue as OptionType}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onMenuOpen={handleMenuOpen}
          onMenuClose={handleMenuClose}
          menuIsOpen={menuIsOpen}
          onBlur={(e) => {
            handleMenuClose()
            onBlur?.(e)
          }}
          closeMenuOnSelect={closeMenuOnSelect}
          placeholder={placeholder}
        />
      </div>
    )
  }
)

Select.displayName = "Select"

export { Select, SelectVariant }
