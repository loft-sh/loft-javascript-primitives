import React from "react"

import { Button } from "../Button"
import { ReactComponent as Empty } from "../images/empty.svg"
import { PlusOutlined } from "@loft-enterprise/icons"

export type SelectEmptyStateProps = {
  onCreateNew?: () => void
  label?: string
  createNewLabel?: string
}

function SelectEmptyState(props: SelectEmptyStateProps) {
  return (
    <div className={"flex w-full flex-col items-center justify-center p-8"}>
      <Empty className={"mb-2"} />
      <div className={"select-none text-sm font-normal text-primary"}>
        {props.label ?? "No items found"}
      </div>
      {props.onCreateNew && (
        <Button variant={"outlined"} className={"mt-2"} onClick={props.onCreateNew}>
          <div className={"flex flex-row items-center"}>
            <PlusOutlined className={"mr-2"} />
            <div>{props.createNewLabel ?? "Create new"}</div>
          </div>
        </Button>
      )}
    </div>
  )
}

SelectEmptyState.displayName = "SelectEmptyState"

export { SelectEmptyState }
