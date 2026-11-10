import React from "react"

import { cn } from "../cn-utils"
import { ReadOutlined } from "@loft-enterprise/icons"

export function DocsLink({ href, label }: { href: string; label: string }) {
  return (
    <div className="inline-flex flex-row items-center gap-1 text-neutral-dark">
      <ReadOutlined className="size-4 *:size-4" />
      <div className={"inline whitespace-nowrap"}>
        Docs:{" "}
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "inline text-neutral-dark transition-all duration-300",
            "border-primary border-b border-neutral-light transition-all hover:border-neutral-dark"
          )}>
          {label}
        </a>
      </div>
    </div>
  )
}
