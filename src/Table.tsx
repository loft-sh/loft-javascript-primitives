import * as React from "react"

import { cx } from "../clsx"

type TableProps = {
  containerStyle?: React.CSSProperties
  hasPagination?: boolean
}

const Table = React.forwardRef<
  HTMLTableElement,
  React.TableHTMLAttributes<HTMLTableElement> & TableProps
>(({ className, hasPagination, containerStyle, ...props }, ref) => (
  <div
    className={cx(
      `revamped-table relative w-full overflow-auto rounded border border-b-0   border-divider-main bg-white`,
      {
        "rounded-b-none": hasPagination,
      }
    )}
    ref={ref}
    style={containerStyle}>
    <table
      className={cx(
        // READ W-FULL
        "caption-bottom border-spacing-0 rounded-md text-sm",
        "[&_th:first-child]:rounded-tl-[5px] [&_th:last-child]:rounded-tr-[5px]",
        "[&_td:first-child]:rounded-bl-[5px] [&_td:last-child]:rounded-br-[5px]",
        className
      )}
      {...props}
    />
  </div>
))
Table.displayName = "Table"

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cx(
      "bg-table-header",
      "",

      className
    )}
    {...props}
  />
))
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => <tbody ref={ref} className={cx("", className)} {...props} />)
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot ref={ref} className={cx("font-medium", className)} {...props} />
))
TableFooter.displayName = "TableFooter"

const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, children, ...props }, ref) => (
    <tr ref={ref} className={cx("group", className)} {...props}>
      {children}
    </tr>
  )
)
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cx(
      "cursor-pointer border-x-0 border-b border-t-0   border-divider-main p-2 px-4 text-left text-xs font-bold text-secondary transition-colors [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:-translate-y-[2.5px]",
      className
    )}
    {...props}
  />
))
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cx(
      "h-[4.5rem] border-x-0 border-b border-t-0   border-b-divider-main bg-table-cell px-4 py-2.5 align-middle text-primary transition-opacity group-hover:bg-table-cell-hover group-data-[state=selected]:bg-table-cell-hover [&>[role=checkbox]]:-translate-y-[2.5px]",
      className
    )}
    {...props}
  />
))
TableCell.displayName = "TableCell"

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption ref={ref} className={cx("text-muted-foreground mt-4 text-sm", className)} {...props} />
))
TableCaption.displayName = "TableCaption"

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption }
