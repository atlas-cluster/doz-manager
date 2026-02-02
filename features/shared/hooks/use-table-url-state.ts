'use client'

import {
  createParser,
  parseAsInteger,
  parseAsString,
  useQueryStates,
} from 'nuqs'

// Re-export shared utilities that work on both server and client
export {
  parseFiltersFromUrlParams,
  serializeFiltersToUrlParams,
} from './table-url-utils'

// Custom parser for pageSize that handles "all" as a special value
const parsePageSize = createParser({
  parse: (value) => {
    if (value === 'all') return 999999999
    const num = parseInt(value)
    return isNaN(num) ? 10 : num
  },
  serialize: (value) => {
    if (value === 999999999) return 'all'
    return String(value)
  },
}).withDefault(10)

// Custom parser for page that uses 1-based indexing in URL (more user-friendly)
// URL shows page=1 for first page, internally we use pageIndex=0
const parsePage = createParser({
  parse: (value) => {
    const num = parseInt(value)
    // Convert from 1-based URL to 0-based internal index
    return isNaN(num) || num < 1 ? 0 : num - 1
  },
  serialize: (value) => {
    // Convert from 0-based internal index to 1-based URL
    // Don't serialize the default (first page) to keep URL clean
    return value === 0 ? null : String(value + 1)
  },
}).withDefault(0)

/**
 * Hook for managing table state in URL parameters using nuqs.
 * Provides type-safe URL state management for pagination, sorting, filtering, and search.
 */
export function useTableUrlState() {
  return useQueryStates(
    {
      // Pagination (1-based in URL, 0-based internally)
      page: parsePage,
      pageSize: parsePageSize,

      // Sorting
      sortBy: parseAsString,
      sortOrder: parseAsString,

      // Global search/filter
      search: parseAsString.withDefault(''),

      // Column filters are now individual params (e.g., ?type=internal&courseLevelPreference=bachelor)
      // They are handled dynamically in the component
    },
    {
      // Use shallow routing to avoid server-side re-renders
      shallow: true,
      // Clear default values from URL
      clearOnDefault: true,
    }
  )
}
