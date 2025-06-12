export type SelectOptionExtraArgs = {
  icon?: React.ReactNode
  suffix?: React.ReactNode
  tag?: React.ReactNode
  disabled?: boolean
  disabledMessage?: string
}

export type TSelectOptionType<ExtraArgs extends SelectOptionExtraArgs = SelectOptionExtraArgs> = {
  value: string
  label: string
  extraArgs?: ExtraArgs
}
