/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ContainerProps,
  DropdownIndicatorProps,
  GroupBase,
  IndicatorsContainerProps,
  InputProps,
  MenuListProps,
  MultiValueRemoveProps,
  OptionProps,
  PlaceholderProps,
  Props as ReactSelectProps,
  ValueContainerProps,
} from "react-select"

export type TSelectProps<OptionType, IsMulti extends boolean> = Omit<
  ReactSelectProps<OptionType, IsMulti, GroupBase<OptionType>>,
  "onChange"
> & {
  components?: {
    SelectContainer?: React.ComponentType<
      TSelectContainerProps<TSelectOptionType, IsMulti, GroupBase<TSelectOptionType>>
    >
    Control?: React.ComponentType<TSelectControlProps<TSelectOptionType, IsMulti>>
    Option?: React.ComponentType<TSelectOptionProps<TSelectOptionType, IsMulti>>
    Input?: React.ComponentType<TSelectInputProps<IsMulti>>
    SingleValue?: React.ComponentType<TSelectSingleValueProps<TSelectOptionType, IsMulti>>
    MultiValue?: React.ComponentType<TSelectMultiValueProps<TSelectOptionType, IsMulti>>
    ValueContainer?: React.ComponentType<
      TSelectMultiValueContainerProps<TSelectOptionType, IsMulti, GroupBase<TSelectOptionType>>
    >
    Placeholder?: React.ComponentType<
      TSelectPlaceholderProps<TSelectOptionType, IsMulti, GroupBase<TSelectOptionType>>
    >
    MenuList?: React.ComponentType<
      TSelectMenuListProps<TSelectOptionType, IsMulti, GroupBase<TSelectOptionType>>
    >
    DropdownIndicator?: React.ComponentType<
      TSelectDropdownIndicatorProps<TSelectOptionType, IsMulti, GroupBase<TSelectOptionType>>
    >
    IndicatorsContainer?: React.ComponentType<
      IndicatorsContainerProps<TSelectOptionType, IsMulti, GroupBase<TSelectOptionType>>
    >
    // Add any other custom components here
  }
  onCreateOption?: (inputValue: string) => void
  inputPrefix?: React.ReactNode
  onChange: (newValue: IsMulti extends true ? OptionType[] : OptionType | null) => void
  disabledOptionTooltipText?: string
  error?: {
    content: React.ReactNode
  }
}

export type SelectOptionExtraArgs = {
  icon?: React.ReactNode
  suffix?: React.ReactNode
  tag?: React.ReactNode
  disabled?: boolean
  disabledMessage?: string
}

export type MultipleTextSelectOptionExtraArgs = SelectOptionExtraArgs & {
  displayCheckbox?: boolean
}

export type TSelectOptionType<ExtraArgs extends SelectOptionExtraArgs = SelectOptionExtraArgs> = {
  value: string
  label: string
  extraArgs?: ExtraArgs
}

export type TSelectMultiValueRemoveProps<
  OptionType,
  IsMulti extends boolean,
> = MultiValueRemoveProps<OptionType, IsMulti, GroupBase<OptionType>>

export type SelectIndicatorsContainerProps<
  OptionType,
  IsMulti extends boolean,
> = IndicatorsContainerProps<OptionType, IsMulti, GroupBase<OptionType>>

export type SelectContainerProps<OptionType, IsMulti extends boolean> = ContainerProps<
  OptionType,
  IsMulti,
  GroupBase<OptionType>
>

export type TSelectContainerProps<
  OptionType extends TSelectOptionType,
  IsMulti extends boolean = false,
  Group extends GroupBase<OptionType> = GroupBase<OptionType>,
> = ContainerProps<OptionType, IsMulti, Group> & {
  error?: {
    content: React.ReactNode
  }
}

export type TSelectInputProps<IsMulti extends boolean> = InputProps<
  TSelectOptionType,
  IsMulti,
  GroupBase<TSelectOptionType>
> & {
  inputPrefix?: React.ReactNode
}

interface CustomValueContainerProps {
  className?: string
  children: React.ReactNode
}

export type TSelectMultiValueContainerProps<
  OptionType extends TSelectOptionType,
  IsMulti extends boolean = true,
  Group extends GroupBase<OptionType> = GroupBase<OptionType>,
> = ValueContainerProps<OptionType, IsMulti, Group> & CustomValueContainerProps

export interface TSelectSingleValueProps<
  OptionType extends TSelectOptionType,
  IsMulti extends boolean,
> {
  children: React.ReactNode
  hasPrefix: boolean
  data: OptionType
}

export interface TSelectMultiValueProps<
  OptionType extends TSelectOptionType,
  IsMulti extends boolean,
> {
  data: OptionType
  removeProps: {
    onClick: () => void
    onTouchEnd: () => void
    onMouseDown: (e: React.MouseEvent) => void
  }
}

export type TSelectDropdownIndicatorProps<
  OptionType extends TSelectOptionType,
  IsMulti extends boolean = false,
  Group extends GroupBase<OptionType> = GroupBase<OptionType>,
> = DropdownIndicatorProps<OptionType, IsMulti, Group>

export type TSelectMenuListProps<
  OptionType extends TSelectOptionType,
  IsMulti extends boolean = false,
  Group extends GroupBase<OptionType> = GroupBase<OptionType>,
> = MenuListProps<OptionType, IsMulti, Group>

export type TSelectOptionProps<
  OptionType extends TSelectOptionType,
  IsMulti extends boolean,
> = OptionProps<OptionType, IsMulti, GroupBase<OptionType>>

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface TSelectControlProps<
  OptionType extends TSelectOptionType,
  IsMulti extends boolean,
> {
  children: React.ReactNode
  selectProps: {
    menuIsOpen?: boolean
    onMenuClose: () => void
    onMenuOpen: () => void
  }
  innerRef: React.Ref<any>
}

export type TSelectPlaceholderProps<
  OptionType extends TSelectOptionType,
  IsMulti extends boolean = false,
  Group extends GroupBase<OptionType> = GroupBase<OptionType>,
> = PlaceholderProps<OptionType, IsMulti, Group> & {
  hasPrefix: boolean
}
