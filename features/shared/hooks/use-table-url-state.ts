import {
  createParser,
  parseAsInteger,
  parseAsString,
  useQueryStates,
} from 'nuqs'

import { ColumnFiltersState } from '@tanstack/react-table'

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

/**
 * Convert URL params to ColumnFiltersState
 * Extracts filter params that are not standard table params
 */
export function parseFiltersFromUrlParams(
  params: Record<string, string | string[] | null>
): ColumnFiltersState {
  const standardParams = new Set([
    'page',
    'pageSize',
    'sortBy',
    'sortOrder',
    'search',
  ])
  const filters: ColumnFiltersState = []

  for (const [key, value] of Object.entries(params)) {
    if (!standardParams.has(key) && value !== null) {
      const values = Array.isArray(value) ? value : [value]
      // Split comma-separated values
      const parsedValues = values.flatMap((v) => v.split(',')).filter(Boolean)
      if (parsedValues.length > 0) {
        filters.push({ id: key, value: parsedValues })
      }
    }
  }

  return filters
}

/**
 * Convert ColumnFiltersState to URL params object
 */
export function serializeFiltersToUrlParams(
  columnFilters: ColumnFiltersState
): Record<string, string | null> {
  const result: Record<string, string | null> = {}

  for (const filter of columnFilters) {
    const values = Array.isArray(filter.value) ? filter.value : [filter.value]
    const valuesStr = values
      .map((v) => String(v))
      .filter((v) => v && v !== 'undefined' && v !== 'null')
      .join(',')

    if (valuesStr) {
      result[filter.id] = valuesStr
    } else {
      result[filter.id] = null
    }
  }

  return result
}

/**
 * Hook for managing table state in URL parameters using nuqs.
 * Provides type-safe URL state management for pagination, sorting, filtering, and search.
 */
export function useTableUrlState() {
  return useQueryStates(
    {
      // Pagination
      page: parseAsInteger.withDefault(0),
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
