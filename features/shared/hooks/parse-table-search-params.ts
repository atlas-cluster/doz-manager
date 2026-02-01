import { parseFiltersFromUrl } from './use-table-url-state'

import { ColumnFiltersState } from '@tanstack/react-table'

/**
 * Parse URL search params for server-side rendering
 * This matches the format used by nuqs on the client side
 */
export function parseTableSearchParams(searchParams: {
  [key: string]: string | string[] | undefined
}) {
  // Parse page (default: 0)
  const page = searchParams.page
    ? parseInt(
        Array.isArray(searchParams.page)
          ? searchParams.page[0]
          : searchParams.page
      )
    : 0

  // Parse pageSize (default: 10)
  const pageSize = searchParams.pageSize
    ? parseInt(
        Array.isArray(searchParams.pageSize)
          ? searchParams.pageSize[0]
          : searchParams.pageSize
      )
    : 10

  // Parse sorting
  const sortBy = searchParams.sortBy
    ? Array.isArray(searchParams.sortBy)
      ? searchParams.sortBy[0]
      : searchParams.sortBy
    : undefined

  const sortOrder = searchParams.sortOrder
    ? Array.isArray(searchParams.sortOrder)
      ? searchParams.sortOrder[0]
      : searchParams.sortOrder
    : undefined

  const sorting =
    sortBy && sortOrder ? [{ id: sortBy, desc: sortOrder === 'desc' }] : []

  // Parse global search
  const search = searchParams.search
    ? Array.isArray(searchParams.search)
      ? searchParams.search[0]
      : searchParams.search
    : ''

  // Parse column filters
  const columnFiltersParam = searchParams.columnFilters
  const columnFiltersArray = columnFiltersParam
    ? Array.isArray(columnFiltersParam)
      ? columnFiltersParam
      : [columnFiltersParam]
    : null

  const columnFilters: ColumnFiltersState =
    parseFiltersFromUrl(columnFiltersArray)

  return {
    pageIndex: page,
    pageSize,
    sorting,
    globalFilter: search,
    columnFilters,
  }
}
