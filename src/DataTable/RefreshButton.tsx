import React, { useCallback, useEffect, useRef, useState } from "react"

import cn from "../../clsx"
import { Button } from "../Button"
import { Tooltip } from "../Tooltip"
import { ReloadOutlined } from "@loft-enterprise/icons"

type RefreshButtonProps = {
  onRefresh: () => void | Promise<void>
}

function RefreshButton({ onRefresh }: RefreshButtonProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleRefresh = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsRefreshing(true)
    try {
      await onRefresh()
    } finally {
      timeoutRef.current = setTimeout(() => setIsRefreshing(false), 200)
    }
  }, [onRefresh])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <Tooltip content="Refresh">
      <Button variant="ghost" onClick={handleRefresh} disabled={isRefreshing} className="ml-2">
        <ReloadOutlined
          className={cn("transition-transform duration-200 *:size-4", {
            "animate-spin": isRefreshing,
          })}
        />
      </Button>
    </Tooltip>
  )
}

export default RefreshButton
