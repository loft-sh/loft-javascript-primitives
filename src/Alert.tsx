import BulbOutlined from "@ant-design/icons/BulbOutlined"
import ExclamationCircleFilled from "@ant-design/icons/ExclamationCircleFilled"
import InfoCircleOutlined from "@ant-design/icons/InfoCircleOutlined"
import WarningOutlined from "@ant-design/icons/WarningOutlined"
import React from "react"

import cn from "../clsx"
import { Button, ButtonProps, ButtonStyles } from "./Button"

type AlertVariant = "info" | "warning" | "error" | "blank" | "neutral" | "danger"

type AlertBoxProps = {
  title?: string
  variant?: AlertVariant
  className?: string
  children?: React.ReactNode
  role?: string
}

export type AlertProps = AlertBoxProps & {
  text?: string | React.ReactNode
  buttonText?: React.ReactNode
  buttonStyles?: ButtonStyles
  onButtonClick?: () => void | Promise<void>
  linkText?: React.ReactNode
  linkUrl?: string
  linkHideUnderline?: boolean
  icon?: React.ReactNode
  hideIcon?: boolean
  textClassName?: string
  contentClassName?: string
  iconWrapperClassName?: string
  truncate?: boolean
}

function AlertBox({ title, variant, className, children, role }: AlertBoxProps) {
  return (
    <div
      role={role}
      className={cn(
        "overflow-hidden rounded-md border px-3 py-3",
        {
          "border-primary-light bg-primary-extra-light": variant === "info",
          "border-warning-light bg-warning-extra-light": variant === "warning",
          "border-error-light bg-error-extra-light": variant === "error",
          "border-neutral-light bg-neutral-extra-light": variant === "neutral",
          "border-neutral-light": variant === "blank",
          "border-danger-light bg-danger-extra-light": variant === "danger",
          "flex flex-col gap-2": title,
        },
        className
      )}>
      {children}
    </div>
  )
}

function truncateAtWord(text: string, maxLength: number = 200): string {
  if (text.length <= maxLength) return text

  // Find the last space at or before maxLength
  let truncateIndex = maxLength

  // If we're in the middle of a word, find the next space after maxLength
  while (truncateIndex < text.length && text[truncateIndex] !== " ") {
    truncateIndex++
  }

  return text.slice(0, truncateIndex).trim()
}

type ShowMoreButtonProps = {
  onClick: () => void
  label?: string
}

function ShowMoreButton({ onClick, label = "Show full message..." }: ShowMoreButtonProps) {
  return (
    <button
      type="button"
      aria-label="Show full message"
      onClick={onClick}
      className="ml-1 text-xs text-primaryColor-main underline hover:no-underline">
      {label}
    </button>
  )
}

function Alert({
  title,
  text,
  buttonText,
  onButtonClick,
  linkText,
  linkUrl,
  variant = "info",
  className,
  children,
  buttonStyles,
  linkHideUnderline,
  icon: Icon,
  hideIcon = false,
  textClassName,
  contentClassName,
  iconWrapperClassName,
  truncate = false,
}: AlertProps) {
  const [isExpanded, setIsExpanded] = React.useState(false)

  const icon = {
    info: <InfoCircleOutlined />,
    neutral: <InfoCircleOutlined />,
    warning: <WarningOutlined />,
    error: <ExclamationCircleFilled />,
    blank: <BulbOutlined />,
    danger: <WarningOutlined />,
  }

  const buttonChild = React.Children.toArray(children).find(
    (child) => React.isValidElement(child) && (child.type as any)?.name === "AlertButton"
  ) as React.ReactElement | undefined

  const contentChildren = React.Children.toArray(children).filter(
    (child) => !React.isValidElement(child) || (child.type as any)?.name !== "AlertButton"
  )

  const getRole = (variant: AlertVariant): string => {
    switch (variant) {
      case "error":
      case "danger":
        return "alert"
      case "info":
      case "warning":
      case "neutral":
      case "blank":
      default:
        return "note"
    }
  }

  // Handle text truncation
  const textString = typeof text === "string" ? text : ""
  const shouldTruncate = truncate && textString.length > 200
  const displayText = shouldTruncate && !isExpanded ? `${truncateAtWord(textString)} ...` : text

  return (
    <AlertBox className={className} title={title} variant={variant} role={getRole(variant)}>
      <div
        className={cn("flex min-w-0 flex-row items-center gap-2 [&_svg]:size-4", contentClassName)}>
        {!hideIcon && (
          <div className={cn("flex-shrink-0", iconWrapperClassName)}>
            {Icon ? Icon : icon[variant]}
          </div>
        )}
        {title ? (
          <span className="min-w-0 break-words text-sm font-semibold">{title}</span>
        ) : contentChildren.length > 0 ? (
          <span className="text-primary-main min-w-0 break-words text-sm">{contentChildren}</span>
        ) : (
          <span className={cn("min-w-0 break-words text-sm", textClassName)}>
            {displayText}
            {shouldTruncate && !isExpanded && (
              <ShowMoreButton onClick={() => setIsExpanded(true)} />
            )}
          </span>
        )}
      </div>
      {title && contentChildren.length > 0 && (
        <span className="text-primary-main overflow-hidden break-words text-sm">
          {contentChildren}
        </span>
      )}
      {title && !contentChildren.length && text && (
        <span
          className={cn(
            "text-primary-main overflow-hidden whitespace-pre-wrap break-words text-sm",
            textClassName
          )}>
          {displayText}
          {shouldTruncate && !isExpanded && <ShowMoreButton onClick={() => setIsExpanded(true)} />}
        </span>
      )}
      {!!(buttonText || buttonChild || linkText) && (
        <div className="flex flex-row items-center gap-2">
          {buttonText && !buttonChild && (
            <Button
              {...buttonStyles}
              className="self-start"
              size="small"
              onClickAsync={onButtonClick}>
              {buttonText}
            </Button>
          )}
          {buttonChild}
          {linkText && linkUrl && (
            <a
              href={linkUrl}
              rel="noreferrer"
              target="_blank"
              className={cn("text-xs", { underline: !linkHideUnderline })}>
              <span className="text-primary-main">{linkText}</span>
            </a>
          )}
        </div>
      )}
    </AlertBox>
  )
}

function AlertButton({ children, ...props }: ButtonProps) {
  return <Button {...props}>{children}</Button>
}

AlertButton.displayName = "AlertButton"

Alert.Box = AlertBox

Alert.Button = AlertButton

export { Alert, AlertBox }
