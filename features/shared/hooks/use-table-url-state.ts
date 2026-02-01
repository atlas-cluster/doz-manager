import {
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  useQueryStates,
} from 'nuqs'

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

      // Column filters (stored as key-value pairs)
      filters: parseAsArrayOf(parseAsString),
    },
    {
      // Use shallow routing to avoid server-side re-renders
      shallow: true,
      // Clear default values from URL
      clearOnDefault: true,
    }
  )
}
