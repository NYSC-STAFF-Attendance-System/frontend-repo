export const DEFAULT_PAGE_SIZE = 10

export function pageItems(
  current: number,
  total: number,
): Array<number | "ellipsis"> {
  if (total <= 5) {
    return Array.from({ length: total }, (_, index) => index + 1)
  }
  if (current <= 3) return [1, 2, 3, "ellipsis", total]
  if (current >= total - 2) return [1, "ellipsis", total - 2, total - 1, total]
  return [1, "ellipsis", current, "ellipsis", total]
}

export function paginate<T>(items: T[], page: number, pageSize: number) {
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize))
  const currentPage = Math.min(Math.max(1, page), pageCount)
  const start = (currentPage - 1) * pageSize

  return {
    pageCount,
    currentPage,
    start,
    from: items.length === 0 ? 0 : start + 1,
    to: Math.min(start + pageSize, items.length),
    total: items.length,
    rows: items.slice(start, start + pageSize),
  }
}
