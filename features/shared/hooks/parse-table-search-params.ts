import { parseFiltersFromUrlParams } from './use-table-url-state'

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

  // Parse pageSize (default: 10), handle "all" as 999999999
  let pageSize = 10
  if (searchParams.pageSize) {
    const pageSizeParam = Array.isArray(searchParams.pageSize)
      ? searchParams.pageSize[0]
      : searchParams.pageSize

    if (pageSizeParam === 'all') {
      pageSize = 999999999
    } else {
      const parsed = parseInt(pageSizeParam)
      if (!isNaN(parsed)) {
        pageSize = parsed
      }
    }
  }

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

  // Parse column filters from individual params (e.g., ?type=internal&courseLevelPreference=bachelor)
  const filterParams: Record<string, string | string[] | null> = {}
  const standardParams = new Set([
    'page',
    'pageSize',
    'sortBy',
    'sortOrder',
    'search',
  ])

  for (const [key, value] of Object.entries(searchParams)) {
    if (!standardParams.has(key) && value !== undefined) {
      filterParams[key] = value
    }
  }

  const columnFilters: ColumnFiltersState =
    parseFiltersFromUrlParams(filterParams)

  return {
    pageIndex: page,
    pageSize,
    sorting,
    globalFilter: search,
    columnFilters,
  }
}
