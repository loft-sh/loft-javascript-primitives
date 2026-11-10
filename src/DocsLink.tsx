import React from "react"

import { cn } from "../cn-utils"
import { ReadOutlined } from "@loft-enterprise/icons"

export function DocsLink({
  href,
  label,
  size = "default",
  className,
  linkClassName,
}: {
  href: string
  label: string
  size?: "small" | "default"
  className?: string
  linkClassName?: string
}) {
  return (
    <div
      className={cn(
        "inline-flex flex-row items-center gap-1 text-sm text-neutral-dark",
        { "text-xs": size === "small" },
        className
      )}>
      <ReadOutlined className={size === "small" ? "size-3 *:size-3" : "size-4 *:size-4"} />
      <div className={"inline whitespace-nowrap"}>
        Docs:{" "}
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "inline text-neutral-dark transition-all duration-300",
            "border-primary border-b border-neutral-light transition-all hover:border-neutral-dark",
            linkClassName
          )}>
          {label}
        </a>
      </div>
    </div>
  )
}
