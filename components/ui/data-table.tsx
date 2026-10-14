"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  DEFAULT_PAGE_SIZE,
  pageItems,
  paginate,
} from "@/lib/pagination"

export type DataTableColumn<T> = {
  id: string
  header: React.ReactNode
  cell: (row: T) => React.ReactNode
  className?: string
  headerClassName?: string
}

export function Pagination({
  page,
  pageCount,
  onPageChange,
}: {
  page: number
  pageCount: number
  onPageChange: (page: number) => void
}) {
  return (
    <div className="flex items-center overflow-hidden rounded-lg border border-line">
      <Button
        variant="ghost"
        size="icon-sm"
        className="rounded-none text-olive-muted"
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        aria-label="Previous page"
      >
        <ChevronLeft className="size-4" />
      </Button>
      {pageItems(page, pageCount).map((item, index) =>
        item === "ellipsis" ? (
          <span
            key={`ellipsis-${index}`}
            className="flex size-8 items-center justify-center text-sm text-olive-muted"
          >
            ...
          </span>
        ) : (
          <Button
            key={item}
            size="icon-sm"
            variant="ghost"
            className={cn(
              "size-8 rounded-none text-sm",
              item === page
                ? "bg-nysc text-white hover:bg-nysc/90 hover:text-white"
                : "text-olive-muted hover:text-ink"
            )}
            onClick={() => onPageChange(item)}
          >
            {item}
          </Button>
        )
      )}
      <Button
        variant="ghost"
        size="icon-sm"
        className="rounded-none text-olive-muted"
        disabled={page === pageCount}
        onClick={() => onPageChange(page + 1)}
        aria-label="Next page"
      >
        <ChevronRight className="size-4" />
      </Button>
    </div>
  )
}

export function DataTable<T>({
  data,
  columns,
  getRowId,
  pageSize = DEFAULT_PAGE_SIZE,
  paginate: enablePagination = true,
  empty = "No records to show.",
  noun = "entries",
  toolbar,
  footer,
  minWidthClass = "min-w-220",
  resetKey,
  page: controlledPage,
  onPageChange,
  onRowClick,
  rowClassName,
  rowAriaLabel,
}: {
  data: T[]
  columns: DataTableColumn<T>[]
  getRowId: (row: T) => string
  pageSize?: number
  paginate?: boolean
  empty?: string
  noun?: string
  toolbar?: React.ReactNode
  footer?: React.ReactNode
  minWidthClass?: string
  resetKey?: string | number
  page?: number
  onPageChange?: (page: number) => void
  onRowClick?: (row: T) => void
  rowClassName?: (row: T) => string | undefined
  rowAriaLabel?: (row: T) => string
}) {
  const [internalPage, setInternalPage] = useState(1)
  const [pageResetKey, setPageResetKey] = useState(resetKey)
  if (controlledPage == null && pageResetKey !== resetKey) {
    setPageResetKey(resetKey)
    setInternalPage(1)
  }
  const page = controlledPage ?? internalPage
  const setPage = onPageChange ?? setInternalPage

  const slice = enablePagination
    ? paginate(data, page, pageSize)
    : {
        pageCount: 1,
        currentPage: 1,
        from: data.length === 0 ? 0 : 1,
        to: data.length,
        total: data.length,
        rows: data,
      }

  return (
    <section className="overflow-hidden rounded-[20px] border border-line/80 bg-white">
      {toolbar}
      <div className="overflow-x-auto">
        <table className={cn("w-full text-left", minWidthClass)}>
          <thead>
            <tr className="border-y border-surface-200 text-[11px] font-semibold tracking-[0.12em] text-olive-muted uppercase">
              {columns.map((column) => (
                <th
                  key={column.id}
                  className={cn("px-3 py-3 font-semibold sm:px-5", column.headerClassName)}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slice.rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-3 py-16 text-center text-sm text-olive-muted sm:px-5"
                >
                  {empty}
                </td>
              </tr>
            ) : (
              slice.rows.map((row) => (
                <tr
                  key={getRowId(row)}
                  className={cn(
                    "border-b border-surface-200 last:border-b-0",
                    onRowClick && "cursor-pointer hover:bg-surface-50",
                    rowClassName?.(row)
                  )}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  onKeyDown={
                    onRowClick
                      ? (event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault()
                            onRowClick(row)
                          }
                        }
                      : undefined
                  }
                  tabIndex={onRowClick ? 0 : undefined}
                  aria-label={rowAriaLabel?.(row)}
                >
                  {columns.map((column) => (
                    <td
                      key={column.id}
                      className={cn("px-3 py-4 sm:px-5", column.className)}
                    >
                      {column.cell(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {enablePagination || footer ? (
        <div className="flex flex-wrap items-center justify-between gap-3 px-3 py-4 sm:px-5">
          {footer ?? (
            <p className="text-sm text-olive-muted">
              Showing{" "}
              <span className="font-semibold text-ink">{slice.from}</span> to{" "}
              <span className="font-semibold text-ink">{slice.to}</span> of{" "}
              <span className="font-semibold text-ink">{slice.total}</span>{" "}
              {noun}
            </p>
          )}
          {enablePagination ? (
            <Pagination
              page={slice.currentPage}
              pageCount={slice.pageCount}
              onPageChange={setPage}
            />
          ) : null}
        </div>
      ) : null}
    </section>
  )
}
