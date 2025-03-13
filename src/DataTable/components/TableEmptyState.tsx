import React from "react"

import { ReadOutlined, SlackOutlined } from "@loft-enterprise/icons"
import { Button } from "@loft-enterprise/primitives"

type EmptyStateProps = {
  title?: string
  icon?: React.ReactNode
  actionButton?: {
    label: string
    onClick: () => void
  }
  children?: React.ReactNode
  showHelp?: boolean
}

function TableEmptyState({
  title,
  icon,
  actionButton,
  children,
  showHelp = false,
}: EmptyStateProps) {
  return (
    <div className="my-10 flex flex-col items-center justify-center space-y-10 text-center text-sm text-primary">
      {icon && <div className="h-[6.75rem] w-[21rem]">{icon}</div>}
      <div className="flex flex-col items-center gap-4">
        {title && <div className="font-medium">{title}</div>}
        {actionButton && <Button onClick={actionButton.onClick}>{actionButton.label}</Button>}
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
