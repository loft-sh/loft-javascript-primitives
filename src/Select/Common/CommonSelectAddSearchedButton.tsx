import React, { useMemo } from "react"

import { cn } from "../../../cn-utils"
import { Tooltip } from "../../Tooltip"
import { CommonSelectStyles } from "./type"
import { InfoCircleOutlined, PlusOutlined } from "@loft-enterprise/icons"

export function CommonSelectAddSearchedButton({
  searchTerm,
  onAddRequested,
  validator,
  label,
}: {
  searchTerm: string
  onAddRequested?: (item: string) => void
  validator?: (value: string) => string | undefined
  label?: string
}) {
  const error = useMemo(() => {
    return validator?.(searchTerm)
  }, [searchTerm, validator])

  if (!searchTerm) {
    return null
  }

  return (
    <button
      className={cn(CommonSelectStyles.ITEM, "flex-row gap-2 pr-2", {
        "cursor-auto text-disabledColor-dark": !!error,
      })}
      onClick={() => {
        if (error) {
          return
        }
        onAddRequested?.(searchTerm)
      }}>
      <PlusOutlined className={"size-4 *:size-4"} />
      <span className={"block"}>
        <span className={"font-medium"}>{label || "Add item"}:</span> {searchTerm}
      </span>
      {error && (
        <Tooltip wrappingTriggerDiv={false} content={error}>
          <InfoCircleOutlined className={"ml-auto size-4 flex-shrink-0 *:size-4"} />
        </Tooltip>
      )}
    </button>
  )
}
