import React from "react"

import { ButtonProps, ButtonStyles } from "../../Button"
import { ReadOutlined, SlackOutlined } from "@loft-enterprise/icons"
import { Button, cn } from "@loft-enterprise/primitives"

type EmptyStateProps = {
  title?: React.ReactNode
  titleClassName?: string
  icon?: React.ReactNode
  iconClassName?: string
  description?: React.ReactNode
  containerClassName?: string
  descriptionClassName?: string
  contentClassName?: string
  actionButton?: {
    label: React.ReactNode
    styles?: ButtonStyles

    onClick: () => void
  } & ButtonProps
  children?: React.ReactNode
  showHelp?: boolean
}

function TableEmptyState({
  title,
  iconClassName,
  titleClassName,
  descriptionClassName,
  containerClassName,
  contentClassName,
  description,
  icon,
  actionButton,
  children,
  showHelp = false,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "my-10 flex flex-col items-center justify-center space-y-10 text-center text-sm text-primary",
        containerClassName
      )}>
      {icon && (
        <div
          className={cn("flex h-[6.75rem] w-[21rem] items-center justify-center", iconClassName)}>
          {icon}
        </div>
      )}
      <div className={cn("flex flex-col items-center gap-4", contentClassName)}>
        {title && <div className={cn("font-medium", titleClassName)}>{title}</div>}
        {description && <div className={cn("text-sm", descriptionClassName)}>{description}</div>}
        {actionButton && (
          <Button {...actionButton.styles} onClick={actionButton.onClick}>
            {actionButton.label}
          </Button>
        )}
        {children}
        {showHelp && (
          <div className="space-y-1">
            <span className="block">Need help?</span>
            <div className="space-x-3">
              <a href="https://slack.loft.sh" target="_blank" rel="noopener noreferrer">
                <SlackOutlined className="size-4" /> Slack Community
              </a>
              <a href="https://vcluster.com/docs" target="_blank" rel="noopener noreferrer">
                <ReadOutlined className="size-4" /> Docs
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export { TableEmptyState }
