import CloseCircleFilled from "@ant-design/icons/CloseCircleFilled"
import { Popover, PopoverContent, PopoverPortal, PopoverTrigger } from "@radix-ui/react-popover"
import * as React from "react"
import {
  createContext,
  Dispatch,
  ForwardedRef,
  forwardRef,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useState,
} from "react"
import { createPortal } from "react-dom"

import { cn, cx } from "../../cn-utils"
import { Checkbox } from "../Checkbox"
import { RemovableValueChip } from "../Common/RemovableValueChip"
import { useOverflowChipVisibility } from "../Common/useOverflowChipVisibility"
import { Tooltip } from "../Tooltip"
import { CommonSelectCaret } from "./Common/CommonSelectCaret"
import { CommonSelectEmptyState } from "./Common/CommonSelectEmptyState"
import { CommonSelectStyles, CommonSelectTriggerProps } from "./Common/type"
import { CloseOutlined, InfoCircleOutlined } from "@loft-enterprise/icons"

type LabelLookup = Record<string, React.ReactNode>

type ContextProps = {
  maxDisplayCount?: number | "infinite"
}

type MultiSelectProps = ContextProps & {
  onValuesChange: (value: string[]) => void
  onOpenChange?: (open: boolean) => void
  values: string[]
  children?: React.ReactNode
}

type MultiSelectContextData = ContextProps & {
  handleTogglePopover: () => void
  clearExtraOptions: () => void
  toggleOption: (option: string) => void
  toggleWildcard: () => void
  handleClear: () => void
  values: string[]
  setIsPopoverOpen: (open: boolean) => void
  isPopoverOpen: boolean
  labelLookup: LabelLookup
  setLabelLookup: Dispatch<SetStateAction<LabelLookup>>
  isWildcardSelected?: boolean
}

const MultiSelectContext = createContext<MultiSelectContextData | undefined>(undefined)

const WILDCARD = "*"

type MultiSelectValueProps = {
  placeholder?: string
  className?: string
  chip?: boolean
  autoFit?: boolean
  disableChipDismissal?: boolean
  hideClear?: boolean
  valueClassName?: string
  statusText?: string
}

function MultiSelectValueItem({
  label,
  onRemoveRequested,
  chip,
  disableChipDismissal,
  hasNext,
  className,
}: {
  label?: React.ReactNode
  onRemoveRequested?: (e: React.MouseEvent<HTMLElement | SVGSVGElement>) => void
  chip?: boolean
  disableChipDismissal?: boolean
  hasNext?: boolean
  className?: string
}) {
  if (chip) {
    return (
      <RemovableValueChip
        className={cn("group/select-value", className)}
        label={label}
        preventRemove={disableChipDismissal}
        onRemoveRequested={onRemoveRequested}
      />
    )
  }

  const titleText = typeof label === "string" ? label : undefined

  return (
    <div
      className={cn(
        "group/select-value flex flex-row items-center overflow-hidden text-tertiary",
        className
      )}
      data-is-select-value={"true"}
      title={titleText}>
      <div
        className={cn("inline-flex flex-row items-center truncate text-primary")}
        title={titleText}>
        {label}
        {hasNext ? "," : ""}
      </div>
    </div>
  )
}

function MultiSelectStatusIndicator({ statusText }: { statusText?: string }) {
  if (!statusText) {
    return null
  }

  return (
    <div className="box-border flex w-fit flex-shrink-0 flex-row items-center pl-2 text-danger-main">
      <Tooltip delayDuration={0} wrappingTriggerDiv={false} content={statusText}>
        <CloseCircleFilled
          aria-hidden="true"
          className="size-4 text-danger-main transition-colors hover:fill-danger-light"
        />
      </Tooltip>
    </div>
  )
}

function MultiSelectValueControls({
  hideClear,
  onClear,
  statusText,
}: {
  hideClear?: boolean
  onClear: () => void
  statusText?: string
}) {
  return (
    <div className="flex flex-shrink-0 items-center justify-between">
      {!hideClear && (
        <CloseOutlined
          className="text-muted-foreground mx-2 h-4 flex-shrink-0 cursor-pointer"
          onClick={(event) => {
            event.stopPropagation()
            onClear()
          }}
        />
      )}
      <MultiSelectStatusIndicator statusText={statusText} />
      <CommonSelectCaret />
    </div>
  )
}

type MultiSelectAutoFitValueProps = {
  values: string[]
  placeholder?: string
  getLabel: (value: string) => React.ReactNode
  onToggleOption: (value: string) => void
  onClear: () => void
  disableChipDismissal?: boolean
  hideClear?: boolean
  valueClassName?: string
  className?: string
  statusText?: string
}

const MultiSelectAutoFitValue = forwardRef<HTMLDivElement, MultiSelectAutoFitValueProps>(
  function MultiSelectAutoFitValue(
    {
      values,
      placeholder,
      getLabel,
      onToggleOption,
      onClear,
      disableChipDismissal,
      hideClear,
      valueClassName,
      className,
      statusText,
    },
    ref
  ) {
    const { measurerRef, valueContainerRef, itemRefs, visibility } = useOverflowChipVisibility(
      values,
      {
        chipGapPx: 4,
        // This is the reserved space for the + x more... text.
        // We take its max size (96px) and then add an extra pixel so we can prevent flicker
        // in some cases when resizing the window fast.
        overflowTailPx: 96 + 1,
      }
    )

    const displayItems = useMemo(() => {
      return visibility.visibleItems.map((value) => (
        <RemovableValueChip
          key={value}
          className={cn("group/select-value", valueClassName)}
          label={getLabel(value)}
          showTooltips={true}
          preventRemove={disableChipDismissal}
          onRemoveRequested={(event) => {
            event.stopPropagation()
            onToggleOption(value)
          }}
        />
      ))
    }, [visibility.visibleItems, valueClassName, getLabel, disableChipDismissal, onToggleOption])

    if (!values.length) {
      return (
        <div
          className={cn("flex min-h-[23px] w-full items-center justify-between", className)}
          ref={ref}>
          <span className="text-tertiary">{placeholder}</span>
          <div className="flex flex-shrink-0 items-center">
            <MultiSelectStatusIndicator statusText={statusText} />
            <CommonSelectCaret />
          </div>
        </div>
      )
    }

    return (
      <div className={cn("flex w-full flex-row items-center overflow-hidden", className)} ref={ref}>
        {createPortal(
          <div
            ref={measurerRef}
            className={
              "pointer-events-none fixed left-0 top-0 h-0 w-0 overflow-scroll opacity-0 [visibility:hidden]"
            }>
            <div className={"flex w-fit flex-shrink-0 flex-row items-center gap-1"}>
              {values.map((value, i) => (
                <RemovableValueChip
                  ref={itemRefs[i]}
                  key={value}
                  className="group/select-value"
                  label={getLabel(value)}
                />
              ))}
            </div>
          </div>,
          document.body
        )}
        <div
          ref={valueContainerRef}
          className={"flex h-auto flex-grow flex-row items-center overflow-hidden"}>
          <div className={"flex h-auto flex-row items-center gap-1 overflow-hidden"}>
            {displayItems}
          </div>

          <div
            className={
              "box-border w-fit max-w-24 flex-shrink-0 truncate pl-1.5 text-sm text-tertiary"
            }>
            {visibility.overflowItemCount ? `+ ${visibility.overflowItemCount} more` : <></>}
          </div>
        </div>
        <MultiSelectValueControls hideClear={hideClear} onClear={onClear} statusText={statusText} />
      </div>
    )
  }
)

export const MultiSelectValue = forwardRef<HTMLDivElement, MultiSelectValueProps>(
  (
    {
      placeholder,
      className,
      chip,
      autoFit,
      disableChipDismissal,
      hideClear,
      valueClassName,
      statusText,
    },
    ref
  ) => {
    const ctx = useContext(MultiSelectContext)

    const selectedValues = ctx?.values ?? []
    const maxDisplayCount = ctx?.maxDisplayCount ?? 3
    const sliceLength = maxDisplayCount === "infinite" ? selectedValues.length : maxDisplayCount
    const useAutoFit = autoFit === true && chip === true

    const getLabel = useCallback(
      (value: string) => ctx?.labelLookup[value] ?? value,
      [ctx?.labelLookup]
    )

    const handleToggleOption = useCallback(
      (value: string) => {
        ctx?.toggleOption(value)
      },
      [ctx]
    )

    const handleClear = useCallback(() => {
      ctx?.handleClear()
    }, [ctx])

    if (useAutoFit) {
      return (
        <MultiSelectAutoFitValue
          ref={ref}
          className={className}
          values={selectedValues}
          placeholder={placeholder}
          getLabel={getLabel}
          onToggleOption={handleToggleOption}
          onClear={handleClear}
          disableChipDismissal={disableChipDismissal}
          hideClear={hideClear}
          valueClassName={valueClassName}
          statusText={statusText}
        />
      )
    }

    return selectedValues.length > 0 ? (
      <div
        className={cn(
          "flex w-full items-center justify-between",
          { "min-h-[23px]": chip },
          className
        )}
        ref={ref}>
        <div className="flex flex-wrap items-center gap-1 overflow-hidden">
          {selectedValues.slice(0, sliceLength).map((value, index) => {
            const label = getLabel(value)
            const hasNext = index < Math.min(sliceLength - 1, selectedValues.length - 1)

            return (
              <MultiSelectValueItem
                key={value}
                className={valueClassName}
                chip={chip}
                label={label}
                hasNext={hasNext}
                disableChipDismissal={disableChipDismissal}
                onRemoveRequested={(event) => {
                  event.stopPropagation()
                  ctx?.toggleOption(value)
                }}
              />
            )
          })}
          {selectedValues.length > sliceLength &&
            (chip ? (
              <div
                className="box-border w-fit max-w-24 flex-shrink-0 cursor-pointer truncate pl-1.5 text-sm text-tertiary"
                onClick={(event) => {
                  event.stopPropagation()
                  ctx?.clearExtraOptions()
                }}>
                {`+ ${selectedValues.length - sliceLength} more`}
              </div>
            ) : (
              <MultiSelectValueItem
                className={valueClassName}
                label={`+ ${selectedValues.length - sliceLength} more`}
                disableChipDismissal={disableChipDismissal}
                onRemoveRequested={(event) => {
                  event.stopPropagation()
                  ctx?.clearExtraOptions()
                }}
              />
            ))}
        </div>
        <MultiSelectValueControls
          hideClear={hideClear}
          onClear={() => ctx?.handleClear()}
          statusText={statusText}
        />
      </div>
    ) : (
      <div
        className={cn(
          "flex w-full items-center justify-between",
          { "min-h-[23px]": chip },
          className
        )}
        ref={ref}>
        <span className="text-tertiary">{placeholder}</span>
        <div className="flex flex-shrink-0 items-center">
          <MultiSelectStatusIndicator statusText={statusText} />
          <CommonSelectCaret />
        </div>
      </div>
    )
  }
)
MultiSelectValue.displayName = "MultiSelectValue"

type MultiSelectTriggerProps = CommonSelectTriggerProps &
  Pick<React.AriaAttributes, "aria-label" | "aria-labelledby">

export const MultiSelectTrigger = forwardRef<HTMLDivElement, MultiSelectTriggerProps>(
  (
    {
      inputSize = "default",
      className,
      children,
      error,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledby,
    },
    ref
  ) => {
    const ctx = useContext(MultiSelectContext)

    return (
      <PopoverTrigger asChild>
        <div
          ref={ref}
          role={"combobox"}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledby}
          onClick={ctx?.handleTogglePopover}
          className={cn(
            CommonSelectStyles.TRIGGER,
            "[&_svg]:pointer-events-auto",
            {
              "px-3 py-1": inputSize === "default",
              "px-2 py-1": inputSize === "small",
              "px-4 py-2": inputSize === "large",
              "border-danger-main hover:border-danger-light focus:border-danger-main": error,
            },
            className
          )}>
          {children}
        </div>
      </PopoverTrigger>
    )
  }
)
MultiSelectTrigger.displayName = "MultiSelectTrigger"

type MultiSelectContentProps = {
  className?: string
  children?: React.ReactNode
}

export const MultiSelectContent = forwardRef<HTMLDivElement, MultiSelectContentProps>(
  ({ className, children }, ref) => {
    const ctx = useContext(MultiSelectContext)

    const [fragment, setFragment] = React.useState<DocumentFragment>()

    useLayoutEffect(() => {
      setFragment(new DocumentFragment())
    }, [])

    const hasNoChildren = React.Children.toArray(children).length === 0

    // If the select is closed, render its content to an unmounted fragment,
    // so we can still display the content of the select items in the value.
    // This technique is used by radix itself:
    // https://github.com/radix-ui/primitives/blob/8d4ac27da9f30f892d36a8b324e923a5449f92f0/packages/react/select/src/select.tsx#L421
    if (!ctx?.isPopoverOpen) {
      const frag = fragment as Element | undefined

      return frag ? createPortal(<div>{children}</div>, frag) : null
    }

    return (
      <PopoverPortal>
        <PopoverContent
          className={cn(
            CommonSelectStyles.CONTENT,
            CommonSelectStyles.CONTENT_POPPER,
            "z-top-level w-[var(--radix-popover-trigger-width)] overflow-y-auto p-0 [scrollbar-width:thin]",
            className
          )}
          ref={ref}
          align="start"
          onEscapeKeyDown={() => ctx.setIsPopoverOpen(false)}>
          <div role={"listbox"}>{hasNoChildren ? <CommonSelectEmptyState /> : children}</div>
        </PopoverContent>
      </PopoverPortal>
    )
  }
)
MultiSelectContent.displayName = "MultiSelectContent"

type MultiSelectItemProps = {
  className?: string
  children?: React.ReactNode
  value: string
}

export const MultiSelectItem = forwardRef<HTMLDivElement, MultiSelectItemProps>(
  ({ value, className, children }, ref) => {
    const { toggleOption, isWildcardSelected } = useContext(MultiSelectContext) ?? {}

    const { isSelected } = useItemState({ value, children })

    const onClick = useCallback(() => {
      toggleOption?.(value)
    }, [value, toggleOption])

    const titleText = typeof children === "string" ? children : undefined

    return (
      <div
        tabIndex={0}
        ref={ref}
        role={"option"}
        aria-selected={isSelected}
        onClick={onClick}
        title={titleText}
        className={cn(CommonSelectStyles.ITEM, "flex-row focus:bg-neutral-extra-light", className)}>
        <Checkbox
          tabIndex={-1}
          checked={isSelected ? isSelected : isWildcardSelected ? "indeterminate" : false}
          className={cx("pointer-events-none mr-3")}
        />
        <span className="truncate">{children}</span>
      </div>
    )
  }
)
MultiSelectItem.displayName = "MultiSelectItem"

type MultiSelectWildcardItemProps = {
  className?: string
  children?: React.ReactNode
  entityName?: string
}

export const MultiSelectWildcardItem = forwardRef<HTMLDivElement, MultiSelectWildcardItemProps>(
  ({ className, children, entityName = "items" }, ref) => {
    const { toggleWildcard } = useContext(MultiSelectContext) ?? {}
    const { isSelected } = useItemState({ value: WILDCARD, children })

    const titleText = typeof children === "string" ? children : undefined

    return (
      <div
        tabIndex={0}
        ref={ref}
        role={"option"}
        aria-selected={isSelected}
        onClick={toggleWildcard}
        title={titleText}
        className={cn(
          CommonSelectStyles.ITEM,
          "flex-row pr-2 focus:bg-neutral-extra-light",
          className
        )}>
        <Checkbox tabIndex={-1} checked={isSelected} className={cx("pointer-events-none mr-3")} />
        <span className="truncate pr-0.5 italic">{children}</span>
        <div className={"ml-auto"}>
          <Tooltip
            wrappingTriggerDiv={false}
            content={`Wildcard selection. If enabled, all existing and future ${entityName} are included automatically.`}>
            <InfoCircleOutlined className={"size-4 text-secondary *:size-4"} />
          </Tooltip>
        </div>
      </div>
    )
  }
)
MultiSelectWildcardItem.displayName = "MultiSelectWildcardItem"

function useItemState({ value, children }: { value: string; children?: React.ReactNode }) {
  const { setLabelLookup, values } = useContext(MultiSelectContext) ?? {}

  const removeLabelEntry = useCallback(() => {
    setLabelLookup?.((prev) => {
      if (!(value in prev)) {
        return prev
      }

      const cloned = { ...prev }
      delete cloned[value]

      return cloned
    })
  }, [value, setLabelLookup])

  useEffect(() => {
    if (!children) {
      removeLabelEntry()

      return
    }

    setLabelLookup?.((prev) => ({ ...prev, [value]: children }))

    return () => {
      removeLabelEntry()
    }
  }, [value, children, removeLabelEntry, setLabelLookup])

  const isSelected = useMemo(() => {
    return values?.includes(value) ?? false
  }, [values, value])

  return useMemo(() => ({ isSelected, removeLabelEntry }), [isSelected, removeLabelEntry])
}

export function MultiSelectSeparator() {
  return <div className="h-[1px] w-full bg-divider-main"></div>
}

export type MultiSelectInstance = {
  setIsPopoverOpen: (isOpen: boolean) => void
}

export const MultiSelect = forwardRef<MultiSelectInstance, MultiSelectProps>(
  (
    { onValuesChange, maxDisplayCount = 3, onOpenChange, values, children }: MultiSelectProps,
    ref: ForwardedRef<MultiSelectInstance>
  ) => {
    const [labelLookup, setLabelLookup] = useState<LabelLookup>({})

    const [isPopoverOpen, setIsPopoverOpen] = useState(false)

    useEffect(() => {
      onOpenChange?.(isPopoverOpen)
    }, [isPopoverOpen, onOpenChange])

    const toggleOption = useCallback(
      (option: string) => {
        const newSelectedValues = values.includes(option)
          ? values.filter((v) => v !== option)
          : [...values, option].filter((v) => v !== WILDCARD)
        onValuesChange(newSelectedValues)
      },
      [values, onValuesChange]
    )

    const toggleWildcard = useCallback(() => {
      const newSelectedValues = values.includes(WILDCARD)
        ? values.filter((v) => v !== WILDCARD)
        : [WILDCARD]

      onValuesChange(newSelectedValues)
    }, [onValuesChange, values])

    const handleClear = useCallback(() => {
      onValuesChange([])
    }, [onValuesChange])

    const handleTogglePopover = useCallback(() => {
      setIsPopoverOpen((prev) => !prev)
    }, [setIsPopoverOpen])

    const clearExtraOptions = useCallback(() => {
      const sliceLength = maxDisplayCount === "infinite" ? values.length : maxDisplayCount
      const newSelectedValues = values.slice(0, sliceLength)
      onValuesChange(newSelectedValues)
    }, [onValuesChange, values, maxDisplayCount])

    const isWildcardSelected = useMemo(() => {
      return values.some((v) => v === WILDCARD)
    }, [values])

    const contextValue = useMemo(
      () => ({
        handleTogglePopover,
        values,
        clearExtraOptions,
        labelLookup,
        setIsPopoverOpen,
        isPopoverOpen,
        setLabelLookup,
        toggleWildcard,
        toggleOption,
        handleClear,
        maxDisplayCount,
        isWildcardSelected,
      }),
      [
        handleTogglePopover,
        values,
        clearExtraOptions,
        labelLookup,
        setIsPopoverOpen,
        isPopoverOpen,
        setLabelLookup,
        toggleWildcard,
        toggleOption,
        handleClear,
        maxDisplayCount,
        isWildcardSelected,
      ]
    )

    useImperativeHandle(ref, () => ({
      setIsPopoverOpen,
    }))

    return (
      <MultiSelectContext.Provider value={contextValue}>
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          {children}
        </Popover>
      </MultiSelectContext.Provider>
    )
  }
)
MultiSelect.displayName = "MultiSelect"
