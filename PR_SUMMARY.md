# nuqs Implementation Summary

This PR implements [nuqs](https://nuqs.47ng.com/) for managing URL parameters in data tables, enabling better caching, shareable URLs, and improved user experience.

## ⚠️ Important Bug Fixes

**Two critical bugs were discovered and fixed** after initial implementation:

1. **Infinite Refresh Loop** - Changed `useEffect` dependencies from derived objects to primitive URL values. See [docs/INFINITE_LOOP_FIX.md](docs/INFINITE_LOOP_FIX.md)
2. **URL Params Not Loading on Refresh** - Added server-side URL parameter parsing to load correct initial data

## Changes Made

### 1. Dependencies

- Added `nuqs@2.8.7` (no security vulnerabilities)

### 2. New Files

- **`features/shared/hooks/use-table-url-state.ts`** - Centralized hook for table URL state management
- **`features/shared/hooks/parse-table-search-params.ts`** - Server-side URL parameter parser
- **`docs/URL_PARAMS.md`** - Comprehensive documentation for URL parameters
- **`docs/INFINITE_LOOP_FIX.md`** - Documentation of the infinite loop bug and fix

### 3. Modified Files

- **`app/layout.tsx`** - Added NuqsAdapter provider
- **`app/(app)/courses/page.tsx`** - Added server-side URL parsing for initial data
- **`app/(app)/lecturers/page.tsx`** - Added server-side URL parsing for initial data
- **`features/courses/components/data-table/data-table.tsx`** - Updated to use nuqs for URL state (+ bug fixes)
- **`features/lecturers/components/data-table/data-table.tsx`** - Updated to use nuqs for URL state (+ bug fixes)

## URL Parameters

Both `/courses` and `/lecturers` pages now support:

| Parameter       | Type          | Default | Description                                      |
| --------------- | ------------- | ------- | ------------------------------------------------ |
| `page`          | number        | 0       | Current page index (0-based)                     |
| `pageSize`      | number        | 10      | Number of items per page                         |
| `sortBy`        | string        | -       | Column ID to sort by                             |
| `sortOrder`     | string        | -       | Sort direction (asc/desc)                        |
| `search`        | string        | ""      | Global search query                              |
| `columnFilters` | array[string] | []      | Column-specific filters (format: "id.val1,val2") |

## Example URLs

```
# Page 2 with 20 items per page
/courses?page=1&pageSize=20

# Sort by last name ascending
/lecturers?sortBy=lastName&sortOrder=asc

# Search with pagination
/courses?search=mathematics&page=0

# Faceted filters (lecturers only)
/lecturers?columnFilters=type.internal&columnFilters=courseLevelPreference.bachelor

# Combined: search, sort, filter, and paginate
/lecturers?search=john&sortBy=email&sortOrder=desc&columnFilters=type.internal&page=1&pageSize=25
```

## Benefits

1. **Better Caching** - URL parameters enable HTTP caching strategies
2. **Shareable URLs** - Users can share specific filtered/sorted/paginated views
3. **Browser History** - Back/forward buttons work correctly with table state
4. **Bookmarkable** - Users can bookmark specific table views
5. **Type Safety** - All parameters are properly typed using nuqs parsers
6. **Clean URLs** - Default values are omitted from URLs
7. **Page Refresh Support** - Refreshing preserves all table state ✨
8. **Faceted Filters in URL** - Column filters are synced to URL ✨

## Technical Implementation

- Uses **shallow routing** to avoid full page reloads
- **Server-side parsing** ensures correct data on page load/refresh
- **Debounced search** input for better UX (500ms delay)
- Pagination **resets to page 0** when filters or search changes
- **Type-safe** parsers ensure correct parameter types
- **Column filter serialization** converts complex state to URL format
- Fully compatible with **React Table** (TanStack Table)

## Testing

- ✅ All existing tests passing (37 tests)
- ✅ TypeScript compilation successful
- ✅ ESLint checks passing
- ✅ No security vulnerabilities
- ✅ Manual verification needed (requires running dev server)

## Next Steps for Testing

To manually test this implementation:

1. Start the development server: `npm run dev`
2. Navigate to `/courses` or `/lecturers`
3. Try the following:
   - Change pages - notice URL updates with `?page=1`
   - Search for something - notice URL updates with `?search=query`
   - Sort a column - notice URL updates with `?sortBy=column&sortOrder=asc`
   - Copy the URL and open in new tab - state is preserved
   - Use browser back/forward buttons - table state changes accordingly
   - Bookmark a filtered/sorted view - returns to same state when accessed

## Documentation

See [`docs/URL_PARAMS.md`](docs/URL_PARAMS.md) for comprehensive documentation including:

- Detailed parameter descriptions
- Usage examples
- Implementation details
- Technical notes
