# URL Parameters for Data Tables

This document explains how URL parameters work for filtering, pagination, and sorting in the data tables.

## Overview

The application now uses [nuqs](https://nuqs.47ng.com/) to manage table state in URL parameters. This provides several benefits:

1. **Better Caching**: URL parameters enable better HTTP caching strategies
2. **Shareable URLs**: Users can share URLs with specific filters, sorting, and pagination applied
3. **Browser History**: Users can use browser back/forward buttons to navigate through different table states
4. **Bookmarkable Views**: Users can bookmark specific filtered/sorted views
5. **Page Refresh Support**: Refreshing the page preserves all table state

## URL Parameters

The following URL parameters are supported on all data table pages (e.g., `/courses`, `/lecturers`):

### Pagination

- `page` (number, default: 0): The current page index (0-based)
- `pageSize` (number or "all", default: 10): Number of items per page, or "all" to show all items

**Example**: `/courses?page=2&pageSize=20` - Shows page 3 (0-indexed) with 20 items per page
**Example**: `/lecturers?pageSize=all` - Shows all lecturers on one page

### Sorting

- `sortBy` (string): Column ID to sort by
- `sortOrder` (string): Sort direction, either "asc" or "desc"

**Example**: `/lecturers?sortBy=lastName&sortOrder=asc` - Sorts lecturers by last name in ascending order

### Search/Filtering

- `search` (string, default: ""): Global search query across all columns

**Example**: `/courses?search=mathematics` - Filters courses containing "mathematics"

### Column Filters (Faceted Filters)

Column filters use the column name directly as the parameter name, with values comma-separated.

**Format**: `?columnName=value1,value2`

**Examples**:

- `/lecturers?type=internal` - Filter to internal lecturers only
- `/lecturers?type=internal,external` - Filter to internal AND external lecturers
- `/lecturers?type=internal&courseLevelPreference=bachelor` - Multiple filters

## Complete Examples

```
# Simple pagination with "all"
/courses?pageSize=all

# Sort by last name ascending
/lecturers?sortBy=lastName&sortOrder=asc

# Search with pagination
/courses?search=mathematics&page=0

# Single faceted filter
/lecturers?type=internal

# Multiple values in one filter
/lecturers?type=internal,external

# Multiple faceted filters
/lecturers?type=internal&courseLevelPreference=bachelor,master

# Combined: search, sort, filter, and paginate
/lecturers?search=john&sortBy=email&sortOrder=desc&type=internal&page=1&pageSize=25
```

## Implementation Details

### Hook Usage

The `useTableUrlState` hook (located in `features/shared/hooks/use-table-url-state.ts`) provides a simple interface for managing table state:

```typescript
import { useTableUrlState } from '@/features/shared/hooks/use-table-url-state'

function MyDataTable() {
  const [urlState, setUrlState] = useTableUrlState()

  // Access current state
  const currentPage = urlState.page
  const searchQuery = urlState.search

  // Update state
  setUrlState({ page: 2, search: 'query' })
}
```

### Features

- **Shallow Routing**: URL updates don't trigger full page reloads
- **Clear on Default**: Default values are not shown in the URL to keep it clean
- **Type Safety**: All parameters are properly typed using nuqs parsers
- **Debounced Search**: Search input is debounced for better UX
- **Server-Side Support**: URL parameters are respected on page load and refresh
- **Clean Filter URLs**: Each filter column gets its own query parameter
- **PageSize "All"**: The "show all" option displays as `pageSize=all` instead of a large number

### Column Filter Format

Column filters use column names directly as query parameters:

**Client State:**

```typescript
;[
  { id: 'type', value: ['internal', 'external'] },
  { id: 'courseLevelPreference', value: ['bachelor'] },
]
```

**URL Format:**

```
?type=internal,external&courseLevelPreference=bachelor
```

Helper functions handle conversion:

- `parseFiltersFromUrlParams()` - Extracts filters from individual URL params → ColumnFiltersState
- `serializeFiltersToUrlParams()` - ColumnFiltersState → Individual URL params

### PageSize Format

The special "all" value for page size:

**Internal Value:** `999999999`  
**URL Display:** `all`

A custom nuqs parser automatically converts between these formats.

### Server-Side Rendering

Pages parse URL parameters on the server to provide correct initial data:

```typescript
// app/(app)/lecturers/page.tsx
export default async function LecturersPage({ searchParams }) {
  const params = await searchParams
  const tableParams = parseTableSearchParams(params) // Parse URL params
  const lecturers = await getLecturers(tableParams) // Fetch with filters
  return <LecturerDataTable initialData={lecturers} />
}
```

This ensures:

- **Refreshing the page** loads the correct filtered/sorted/paginated data
- **Direct URL navigation** shows the right data immediately
- **Sharing URLs** works perfectly - recipients see the same view

### Modified Components

The following components have been updated to use nuqs:

1. `features/courses/components/data-table/data-table.tsx` - Client-side table state
2. `features/lecturers/components/data-table/data-table.tsx` - Client-side table state
3. `app/(app)/courses/page.tsx` - Server-side URL parsing
4. `app/(app)/lecturers/page.tsx` - Server-side URL parsing

### Provider Setup

The `NuqsAdapter` is configured in the root layout (`app/layout.tsx`) to enable nuqs functionality throughout the application.

## Examples

### Share a Filtered View with Faceted Filters

1. Navigate to the Lecturers page
2. Click "Type" filter and select "Internal"
3. Click "Preference" filter and select "Bachelor"
4. Apply sorting (e.g., by Last Name, descending)
5. Navigate to page 2
6. Copy the URL: `/lecturers?page=1&sortBy=lastName&sortOrder=desc&type=internal&courseLevelPreference=bachelor`
7. Share this URL with colleagues - they will see the exact same filtered and sorted view
8. **Refreshing the page preserves all filters** ✨

### Bookmark a Common Query

1. Navigate to the Courses page
2. Search for "Data Science"
3. Sort by course name
4. Bookmark the URL: `/courses?search=Data%20Science&sortBy=name&sortOrder=asc`
5. Later, access this bookmark to quickly view the same filtered results

### Use "Show All" Feature

1. Navigate to the Lecturers page
2. Select "Alle" from the page size dropdown
3. URL updates to: `/lecturers?pageSize=all`
4. All lecturers are displayed on a single page
5. **The URL shows "all" instead of a large number** ✨

### Test URL Parameter Persistence

1. Apply multiple filters on the Lecturers page
2. Navigate to page 3
3. Press F5 to refresh
4. ✅ All filters, sorting, and pagination are preserved
5. Use browser back button
6. ✅ Previous state is restored

## Technical Notes

- URL state is synced with component state automatically
- Server-side pages parse URL parameters on initial load
- When filters or search change, pagination is reset to page 0
- When filters or search change, pagination is reset to page 0
- The implementation uses React Table (TanStack Table) for table functionality
- All URL updates use shallow routing to avoid unnecessary server requests
