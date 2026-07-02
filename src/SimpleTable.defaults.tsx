import { SimpleTableRowAction } from "./SimpleTable"
import { CopyOutlined } from "@loft-enterprise/icons"
import { str } from "@loft-enterprise/shared"

/**
 * Default "copy to clipboard" row action for {@link SimpleTable}. Returns an empty
 * array when there is no value to copy, so callers can spread it unconditionally.
 */
export function copyToClipboardRowAction(value: string | undefined): SimpleTableRowAction[] {
  if (!value) {
    return []
  }

  return [
    {
      icon: CopyOutlined,
      ariaLabel: "Copy to clipboard",
      onClick: (e) => {
        e.stopPropagation()
        void navigator.clipboard.writeText(value)
      },
    },
  ]
}

/**
 * Builds a {@link SimpleTableRowData} value (plus tooltip and a copy action) from a
 * single string. Falls back to an em dash placeholder and omits the copy action when
 * the value is empty.
 */
export function tableValueWithCopy(value: string | undefined): {
  value: string
  valueTooltip?: string
  actions: SimpleTableRowAction[]
} {
  const display = str(value) || "–"
  const hasValue = display !== "–"

  return {
    value: display,
    valueTooltip: hasValue ? display : undefined,
    actions: copyToClipboardRowAction(hasValue ? display : undefined),
  }
}
