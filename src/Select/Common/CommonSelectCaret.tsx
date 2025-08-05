import * as React from "react"

import { DownOutlined } from "@loft-enterprise/icons"

export function CommonSelectCaret({ icon: Icon = DownOutlined }: { icon?: React.ElementType }) {
  return (
    <Icon className="flex-shrink-0 cursor-pointer opacity-50 transition-transform *:size-3.5 group-aria-[expanded=true]:rotate-180" />
  )
}
