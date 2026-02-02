# nuqs Implementation Summary

## Overview

This document summarizes the complete implementation of nuqs for URL state management in the doz-manager application, including all issues encountered and their resolutions.

## Implementation Journey

### Phase 1: Initial Implementation
**Goal**: Add nuqs for basic URL parameter management

**Changes**:
- Installed nuqs v2.8.7
- Created `useTableUrlState` hook
- Updated data tables to use URL state for pagination, sorting, and search

### Phase 2: Fix Infinite Refresh Loop
**Issue**: App got stuck in infinite refresh loop

**Root Cause**: useEffect depended on derived objects (pagination, sorting, globalFilter) that were recreated on every render

**Solution**: Changed useEffect dependencies to use primitive URL state values directly
```typescript
// Before: [pagination, sorting, globalFilter]
// After: [urlState.page, urlState.pageSize, urlState.sortBy, urlState.sortOrder, urlState.search]
```

### Phase 3: Add Faceted Filters to URL
**Issue**: Column filter buttons didn't update URL

**Solution**: 
- Added serialization helpers for columnFilters
- Changed URL format from array to individual params
- Example: `?type=internal&courseLevelPreference=bachelor`

### Phase 4: Fix Page Refresh Not Loading Data
**Issue**: Refreshing page with URL params didn't load the filtered data

**Root Cause**: Server-side page components weren't reading URL params

**Solution**:
- Created `parseTableSearchParams` for server-side URL parsing
- Updated page components to pass parsed params to get functions

### Phase 5: Fix Server/Client Boundary Error
**Issue**: `Error: Attempted to call createParser() from the server`

**Root Cause**: `createParser` from nuqs is client-only but was imported by server-side code

**Solution**:
- Created `table-url-utils.ts` for shared utilities
- Added `'use client'` directive to `use-table-url-state.ts`
- Separated server and client code properly

### Phase 6: Fix Table Not Updating After Edit
**Issue**: Editing rows didn't update table immediately

**Root Cause**: Incorrect `revalidateTag` API usage for Next.js 16

**Solution**: Changed `revalidateTag('tag', {})` to `revalidateTag('tag', '')`

### Phase 7: Fix Row Selection Persisting
**Issue**: Selected rows remained selected when changing pages/filters

**Solution**: Added `setRowSelection({})` to useEffect that runs on URL state changes

### Phase 8: Improve URL Format
**Issue**: URLs were verbose and used technical terms

**Solutions**:
1. Changed from `?columnFilters=type.internal` to `?type=internal`
2. Changed from `?pageSize=999999999` to `?pageSize=all`

### Phase 9: Fix Column Filter Buttons Not Working
**Issue**: Column filter buttons caused rerender but didn't update URL

**Root Cause**: nuqs's `useQueryStates` only manages params in its schema, not dynamic params

**Solution**: Use Next.js router directly for dynamic column filter params
```typescript
const router = useRouter()
router.push(`${pathname}?${queryString}`, { scroll: false })
```

### Phase 10: Fix URL Comma Encoding
**Issue**: Commas in filter values were encoded as `%2C`

**Solution**: Manual query string construction to preserve unencoded commas
```typescript
// Don't use URLSearchParams.toString() - it encodes commas
// Instead, manually build query string
const queryParts: string[] = []
params.forEach((value, key) => {
  if (standardParams.has(key)) {
    queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
  } else {
    // Filter params - don't encode commas
    queryParts.push(`${encodeURIComponent(key)}=${value}`)
  }
})
```

### Phase 11: Fix Reset Button Not Clearing Filters
**Issue**: Reset button only cleared global search, not column filters

**Solution**: Special handling when clearing all filters - delete ALL non-standard params
```typescript
if (newFilters.length === 0) {
  // Delete ALL non-standard params
  const keysToDelete: string[] = []
  params.forEach((_, key) => {
    if (!standardParams.has(key)) {
      keysToDelete.push(key)
    }
  })
  keysToDelete.forEach(key => params.delete(key))
}
```

### Phase 12: Fix Pagination Display and Unnecessary Params
**Issues**:
1. Pagination showed `?page=0` (confusing)
2. Adding filters always added `?page=0` even when unnecessary
3. Reset button still not working properly

**Solutions**:
1. **1-Based Pagination in URL**:
   - Created custom `parsePage` parser
   - URL uses `page=1` for first page, `page=2` for second
   - Internal code still uses 0-based indexing (pageIndex 0, 1, 2)
   - First page omits param entirely for clean URLs

2. **Only Add Page When Needed**:
   - Changed `params.set('page', '0')` to `params.delete('page')`
   - Page param only appears when NOT on first page

## Final Architecture

### URL Parameter Types

**Standard Parameters** (managed by nuqs):
- `page` - Current page (1-based in URL, 0-based internally, omitted for first page)
- `pageSize` - Items per page (10, 20, 30, 40, 50, or "all")
- `sortBy` - Column to sort by
- `sortOrder` - Sort direction (asc/desc)
- `search` - Global search query

**Dynamic Parameters** (managed by Next.js router):
- Column filters (e.g., `type=internal`, `courseLevelPreference=bachelor,master`)

### Example URLs

**First page, no filters**:
```
/lecturers
```

**First page with filters**:
```
/lecturers?type=internal&courseLevelPreference=bachelor,master
```

**Second page with filters and search**:
```
/lecturers?page=2&type=internal&search=john&pageSize=all
```

**Third page, sorted**:
```
/lecturers?page=3&sortBy=lastName&sortOrder=asc
```

## Benefits Achieved

✅ **Better Caching**: URL parameters enable HTTP caching  
✅ **Shareable URLs**: Users can share exact views  
✅ **Browser History**: Back/forward work correctly  
✅ **Bookmarkable**: Specific views can be bookmarked  
✅ **Type Safety**: nuqs provides type-safe parameter handling  
✅ **Clean URLs**: No unnecessary params, no URL encoding, 1-based pagination  
✅ **User-Friendly**: Intuitive parameter names and values  
✅ **Server-Side Rendering**: Initial page load respects URL state  

## Lessons Learned

1. **nuqs limitations**: Can only manage predefined params, not dynamic ones
2. **Server/client separation**: Important to separate concerns in Next.js App Router
3. **useEffect dependencies**: Use primitive values, not derived objects
4. **URL encoding**: Manual query string construction needed for specific requirements
5. **1-based pagination**: More intuitive for users, but requires careful conversion
6. **Reset logic**: Need to explicitly clear ALL dynamic params, not just known ones

## Files Modified

### Core Implementation
- `features/shared/hooks/use-table-url-state.ts` - Client-side URL state hook
- `features/shared/hooks/parse-table-search-params.ts` - Server-side URL parser  
- `features/shared/hooks/table-url-utils.ts` - Shared utilities
- `features/lecturers/components/data-table/data-table.tsx` - Lecturers table
- `features/courses/components/data-table/data-table.tsx` - Courses table

### Server-Side Pages
- `app/(app)/lecturers/page.tsx` - Parse URL on server
- `app/(app)/courses/page.tsx` - Parse URL on server
- `app/layout.tsx` - NuqsAdapter provider

### Server Actions
- All create/update/delete actions - Fixed `revalidateTag` calls

## Testing Checklist

✅ Column filters add/remove correctly  
✅ Pagination updates URL correctly  
✅ Sorting updates URL correctly  
✅ Search updates URL correctly  
✅ Reset button clears all filters  
✅ Page refresh loads correct data  
✅ Browser back/forward works  
✅ URL sharing works  
✅ No infinite loops  
✅ No server/client errors  
✅ Table updates after edits  
✅ Row selection clears on navigation  
✅ Clean URL format (no %2C, no page=0, 1-based pagination)  

## Future Improvements

1. Consider using nuqs v2's upcoming dynamic params support (if released)
2. Add URL state for column visibility
3. Consider persisting column widths in URL
4. Add analytics tracking for filter usage via URL params
