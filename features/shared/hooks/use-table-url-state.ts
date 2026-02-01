import {
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  useQueryStates,
} from 'nuqs'

import { ColumnFiltersState } from '@tanstack/react-table'

/**
 * Convert URL filter strings to ColumnFiltersState
 * URL format: ["type.internal,external", "courseLevelPreference.bachelor"]
 * Output: [{ id: "type", value: ["internal", "external"] }, { id: "courseLevelPreference", value: ["bachelor"] }]
 */
export function parseFiltersFromUrl(
  urlFilters: string[] | null
): ColumnFiltersState {
  if (!urlFilters || urlFilters.length === 0) {
    return []
  }

  return urlFilters
    .map((filter) => {
      const [id, valuesStr] = filter.split('.')
      if (!id || !valuesStr) return null

      const values = valuesStr.split(',').filter(Boolean)
      if (values.length === 0) return null

      return { id, value: values }
    })
    .filter((f): f is { id: string; value: string[] } => f !== null)
}

/**
 * Convert ColumnFiltersState to URL filter strings
 * Input: [{ id: "type", value: ["internal", "external"] }, { id: "courseLevelPreference", value: ["bachelor"] }]
 * Output: ["type.internal,external", "courseLevelPreference.bachelor"]
 */
export function serializeFiltersToUrl(
  columnFilters: ColumnFiltersState
): string[] | null {
  if (!columnFilters || columnFilters.length === 0) {
    return null
  }

  const urlFilters = columnFilters
    .map((filter) => {
      const values = Array.isArray(filter.value) ? filter.value : [filter.value]
      const valuesStr = values.filter(Boolean).join(',')
      if (!valuesStr) return null

      return `${filter.id}.${valuesStr}`
    })
    .filter((f): f is string => f !== null)

  return urlFilters.length > 0 ? urlFilters : null
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
      pageSize: parseAsInteger.withDefault(10),

      // Sorting
      sortBy: parseAsString,
      sortOrder: parseAsString,

      // Global search/filter
      search: parseAsString.withDefault(''),

      // Column filters - format: "columnId.value1,value2"
      // Example: type.internal,external or courseLevelPreference.bachelor
      columnFilters: parseAsArrayOf(parseAsString),
    },
    {
      // Use shallow routing to avoid server-side re-renders
      shallow: true,
      // Clear default values from URL
      clearOnDefault: true,
    }
  )
}
