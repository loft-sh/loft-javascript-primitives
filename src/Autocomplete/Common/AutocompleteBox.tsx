import cn from "clsx"
import React, { forwardRef } from "react"

export type AutocompleteBoxProps = {
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void
  children?: React.ReactNode
  className?: string
  contentClassName?: string
  icon?: React.ReactNode
  onKeyboardOpen?: () => void
  captureKeyboard?: boolean
}

export const AutocompleteBox = forwardRef<HTMLDivElement, AutocompleteBoxProps>(
  function InnerAutocompleteBox(
    { onClick, onKeyboardOpen, icon, children, contentClassName, className, captureKeyboard },
    ref
  ) {
    // TODO: ARIA attributes (ref: ENG-9006)
    return (
      <div
        className={cn(
          "flex h-auto w-full cursor-text flex-row gap-2 border border-divider-main bg-white py-1 pl-3 hover:border-primary-light focus:border-primary-light",
          "min-h-[33px] rounded-md text-sm transition-colors focus:outline-none",
          className
        )}
        tabIndex={captureKeyboard ? 0 : undefined}
        onKeyDown={(e) => {
          if (captureKeyboard && e.key === "Enter") {
            e.stopPropagation()
            e.preventDefault()
            onKeyboardOpen?.()
          }
        }}
        onClick={onClick}>
        {icon && (
          <div className={"flex h-fit min-h-[23px] flex-shrink-0 flex-row items-center"}>
            <div className={"h-fit flex-shrink-0  text-secondary *:block [&_*]:size-4"}>{icon}</div>
          </div>
        )}
        <div
          ref={ref}
          className={cn("flex h-auto w-full flex-grow flex-row gap-1 pr-3", contentClassName)}>
          {children}
        </div>
      </div>
    )
  }
)
