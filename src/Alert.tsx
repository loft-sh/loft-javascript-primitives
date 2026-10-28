import BulbOutlined from "@ant-design/icons/BulbOutlined"
import ExclamationCircleFilled from "@ant-design/icons/ExclamationCircleFilled"
import InfoCircleOutlined from "@ant-design/icons/InfoCircleOutlined"
import WarningOutlined from "@ant-design/icons/WarningOutlined"
import React, { useId } from "react"

import { cn } from "../cn-utils"
import { Button, ButtonStyles } from "./Button"
import { IconText } from "./IconText"
import { IconComponentFunction, XOr } from "@loft-enterprise/shared"

export type AlertAction = {
  label: string
  style?: ButtonStyles
  disabled?: boolean
  onClick?: (e: React.MouseEvent<HTMLElement>) => unknown
} & XOr<
  { icon: IconComponentFunction; iconPosition?: "left" | "right"; iconClassName?: string },
  {}
>

export type AlertVariant = "info" | "warning" | "error" | "blank" | "neutral" | "danger"

// Icons are primarily used in conjunction with titles.
type TitleProps = { title: string } & XOr<{ icon?: IconComponentFunction }, { hideIcon?: boolean }>

// Icons can be still supported without titles, if we explicitly add the forceIcon flag.
type NoTitleProps = XOr<{ forceIcon?: false }, { forceIcon: true; icon?: IconComponentFunction }>

export type AlertProps = {
  variant?: AlertVariant

  children?: React.ReactNode

  actions?: AlertAction[]

  className?: string
  "aria-label"?: string
  role?: string
} & XOr<TitleProps, NoTitleProps>

const VARIANT_DEFINITIONS: {
  [key in AlertVariant]: { className: string; icon: IconComponentFunction; role: string }
} = {
  info: {
    className: "border-primary-light bg-primary-extra-light",
    icon: InfoCircleOutlined,
    role: "note",
  },
  blank: { className: "border-neutral-light", icon: BulbOutlined, role: "note" },
  neutral: {
    className: "border-neutral-light bg-neutral-extra-light",
    icon: InfoCircleOutlined,
    role: "note",
  },
  warning: {
    className: "border-warning-light bg-warning-extra-light",
    icon: WarningOutlined,
    role: "note",
  },
  error: {
    className: "border-error-light bg-error-extra-light",
    icon: ExclamationCircleFilled,
    role: "alert",
  },
  danger: {
    className: "border-danger-light bg-danger-extra-light",
    icon: WarningOutlined,
    role: "alert",
  },
}

export function Alert({
  variant = "info",
  children,
  actions,
  className,
  "aria-label": ariaLabel,
  role,
  ...props
}: AlertProps) {
  const variantDefinition = VARIANT_DEFINITIONS[variant]

  const Icon = props.icon || (!props.hideIcon ? variantDefinition.icon : undefined)

  const id = useId()
  const titleId = `${id}_title`

  return (
    <div
      role={role ?? variantDefinition.role}
      aria-label={ariaLabel}
      aria-labelledby={!ariaLabel && props.title ? titleId : undefined}
      className={cn(
        "flex flex-col gap-2 rounded-md border px-3 py-3 text-primary",
        variantDefinition.className,
        className
      )}>
      {props.title && (
        <IconText id={titleId} icon={Icon} className="text-sm font-semibold">
          {props.title}
        </IconText>
      )}
      {children &&
        (!props.forceIcon ? (
          <div className="text-sm">{children}</div>
        ) : (
          <IconText icon={Icon} className="text-sm">
            {children}
          </IconText>
        ))}
      {actions && actions.length > 0 && (
        <div
          className={cn("flex flex-row flex-wrap items-center gap-2", {
            "pl-6": !!props.forceIcon,
          })}>
          {actions.map((action, index) => (
            <Button
              key={index}
              size="small"
              {...action.style}
              disabled={action.disabled}
              onClickAsync={action.onClick}>
              {action.icon && action.iconPosition !== "right" && (
                <action.icon className={cn("size-4 *:size-4", action.iconClassName)} />
              )}
              {action.label}
              {action.icon && action.iconPosition === "right" && (
                <action.icon className={cn("size-4 *:size-4", action.iconClassName)} />
              )}
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}
