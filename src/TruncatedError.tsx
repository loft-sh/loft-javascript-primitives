import React, { useEffect, useMemo, useState } from "react"

import { cn } from "../cn-utils"

export function TruncatedError({
  error,
  className,
}: {
  error?: {
    title?: string
    message?: string
  }
  className?: string
}) {
  const [expanded, setExpanded] = useState(false)

  const hasError = !!error

  const errorMessage = useMemo(() => {
    if (!hasError) {
      return undefined
    }

    if (error.message && error.message.length > 256) {
      return {
        title: error.title,
        message: error.message.substring(0, 256).trim() + "...",
        fullMessage: error.message,
        canExpand: true,
      }
    }

    return { title: error.title, message: error.message, fullMessage: error.message }
  }, [error?.title, error?.message, hasError])

  useEffect(() => {
    if (!errorMessage) {
      setExpanded(false)
    }
  }, [errorMessage])

  if (!errorMessage) {
    return null
  }

  return (
    <div className={cn("flex w-full flex-col gap-1 bg-danger-extra-light p-2 text-sm", className)}>
      {errorMessage.title && <div className={"font-medium"}>{errorMessage.title}</div>}

      <div>
        {expanded ? errorMessage.fullMessage : errorMessage.message}{" "}
        {errorMessage.canExpand && !expanded && (
          <span
            className={"inline-block cursor-pointer text-primaryColor-main"}
            onClick={(e) => {
              e.stopPropagation()
              setExpanded(true)
            }}>
            Show full error message
          </span>
        )}
      </div>
    </div>
  )
}
