# URL Parameters for Data Tables

This document explains how URL parameters work for filtering, pagination, and sorting in the data tables.

## Overview

The application now uses [nuqs](https://nuqs.47ng.com/) to manage table state in URL parameters. This provides several benefits:

1. **Better Caching**: URL parameters enable better HTTP caching strategies
2. **Shareable URLs**: Users can share URLs with specific filters, sorting, and pagination applied
3. **Browser History**: Users can use browser back/forward buttons to navigate through different table states
4. **Bookmarkable Views**: Users can bookmark specific filtered/sorted views

## URL Parameters

The following URL parameters are supported on all data table pages (e.g., `/courses`, `/lecturers`):

### Pagination

- `page` (number, default: 0): The current page index (0-based)
- `pageSize` (number, default: 10): Number of items per page

**Example**: `/courses?page=2&pageSize=20` - Shows page 3 (0-indexed) with 20 items per page

### Sorting

- `sortBy` (string): Column ID to sort by
- `sortOrder` (string): Sort direction, either "asc" or "desc"

**Example**: `/lecturers?sortBy=lastName&sortOrder=asc` - Sorts lecturers by last name in ascending order

### Search/Filtering

- `search` (string, default: ""): Global search query across all columns

**Example**: `/courses?search=mathematics` - Filters courses containing "mathematics"

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

### Modified Components

The following components have been updated to use nuqs:

1. `features/courses/components/data-table/data-table.tsx`
2. `features/lecturers/components/data-table/data-table.tsx`

### Provider Setup

The `NuqsAdapter` is configured in the root layout (`app/layout.tsx`) to enable nuqs functionality throughout the application.

## Examples

### Share a Filtered View

1. Navigate to the Lecturers page
2. Apply filters (e.g., Type: Internal, Preference: Bachelor)
3. Apply sorting (e.g., by Last Name, descending)
4. Navigate to page 2
5. Copy the URL: `/lecturers?page=1&sortBy=lastName&sortOrder=desc`
6. Share this URL with colleagues - they will see the exact same filtered and sorted view

### Bookmark a Common Query

1. Navigate to the Courses page
2. Search for "Data Science"
3. Sort by course name
4. Bookmark the URL: `/courses?search=Data%20Science&sortBy=name&sortOrder=asc`
5. Later, access this bookmark to quickly view the same filtered results

## Technical Notes

- URL state is synced with component state automatically
- When filters or search change, pagination is reset to page 0
- The implementation uses React Table (TanStack Table) for table functionality
- All URL updates use shallow routing to avoid unnecessary server requests
