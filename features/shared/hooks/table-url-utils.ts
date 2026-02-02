import { ColumnFiltersState } from '@tanstack/react-table'

/**
 * Convert URL params to ColumnFiltersState
 * Extracts filter params that are not standard table params
 *
 * This utility works on both server and client side.
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
 *
 * This utility works on both server and client side.
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
