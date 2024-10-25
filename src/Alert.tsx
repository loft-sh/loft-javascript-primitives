import BulbOutlined from "@ant-design/icons/BulbOutlined"
import ExclamationCircleFilled from "@ant-design/icons/ExclamationCircleFilled"
import InfoCircleOutlined from "@ant-design/icons/InfoCircleOutlined"
import WarningOutlined from "@ant-design/icons/WarningOutlined"
import React from "react"

import cn from "../clsx"
import { Button, ButtonProps } from "./Button"

type Props = {
  title?: string
  text: string
  buttonText?: string
  onButtonClick?: () => Promise<void>
  linkText?: string
  linkUrl?: string
  variant?: "info" | "warning" | "error" | "blank"
  className?: string
  children?: React.ReactNode
  icon?: React.ReactNode
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
  icon: Icon,
}: Props) {
  const icon = {
    info: <InfoCircleOutlined />,
    warning: <WarningOutlined />,
    error: <ExclamationCircleFilled />,
    blank: <BulbOutlined />,
  }

  const buttonChild = React.Children.toArray(children).find(
    (child) => React.isValidElement(child) && (child.type as any)?.name === "AlertButton"
  ) as React.ReactElement | undefined

  return (
    <div
      className={cn("rounded-md border px-3 py-3", className, {
        "border-primary-light bg-primary-extra-light": variant === "info",
        "border-warning-light bg-warning-extra-light": variant === "warning",
        "border-error-light bg-error-extra-light": variant === "error",
        "border-neutral-light": variant === "blank",
        "flex flex-col gap-2": title,
      })}>
      <span className="flex flex-row items-center gap-2 [&_svg]:size-4">
        {Icon ? Icon : icon[variant]}
        {title ? <span className="font-bold">{title}</span> : <span>{text}</span>}
      </span>
      {title && <span className="text-primary-main text-sm">{text}</span>}
      <div className="flex flex-row items-center gap-2">
        {buttonText && !buttonChild && (
          <Button className="self-start" size="small" onClickAsync={onButtonClick}>
            {buttonText}
          </Button>
        )}
        {buttonChild}
        {linkText && linkUrl && (
          <a href={linkUrl} rel="noreferrer" target="_blank" className="text-xs underline">
            <span className="text-primary-main">{linkText}</span>
          </a>
        )}
      </div>
    </div>
  )
}

function AlertButton({ children, ...props }: ButtonProps) {
  return <Button {...props}>{children}</Button>
}

AlertButton.displayName = "AlertButton"

Alert.Button = AlertButton

export { Alert }
