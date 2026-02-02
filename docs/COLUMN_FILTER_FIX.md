# Column Filter Button Fix

## Problem

Column filter buttons were not working. When clicking to add or remove filters, nothing happened except the page reloading. The filters would not be added to or removed from the URL.

## Root Cause

The `setColumnFilters` function in both data table components was not properly managing URL parameters when filters changed.

### Before (Broken Code)

```typescript
const setColumnFilters = (updaterOrValue) => {
  const newFilters = /* ... calculate new filters ... */

  const filterParams = serializeFiltersToUrlParams(newFilters)
  setUrlState({
    ...filterParams,  // Only sets new filter params
    page: 0,
  })
}
```

**The Problem:**
When removing a filter, the old URL parameter wasn't being explicitly cleared. For example:

1. Current URL: `?type=internal&courseLevelPreference=bachelor`
2. User removes "type" filter
3. `newFilters` becomes `[{ id: "courseLevelPreference", value: ["bachelor"] }]`
4. `filterParams` becomes `{ courseLevelPreference: "bachelor" }`
5. `setUrlState` is called with `{ courseLevelPreference: "bachelor", page: 0 }`
6. **URL still shows `?type=internal&courseLevelPreference=bachelor`** ❌

The `type` parameter was never removed because we never told nuqs to set it to `null`.

## Solution

We now explicitly clear all existing filter parameters before setting new ones:

### After (Working Code)

```typescript
const setColumnFilters = (updaterOrValue) => {
  const newFilters = /* ... calculate new filters ... */

  // Get all current filter column names to clear them
  const currentFilterColumns: Record<string, null> = {}
  columnFilters.forEach((filter) => {
    currentFilterColumns[filter.id] = null
  })

  // Serialize the new filters
  const filterParams = serializeFiltersToUrlParams(newFilters)

  // Update URL: first clear old filters, then set new ones
  setUrlState({
    ...currentFilterColumns, // Clear all existing filters
    ...filterParams,         // Set new filter values
    page: 0,
  })
}
```

**How It Works:**

1. Current URL: `?type=internal&courseLevelPreference=bachelor`
2. User removes "type" filter
3. `currentFilterColumns` = `{ type: null, courseLevelPreference: null }`
4. `filterParams` = `{ courseLevelPreference: "bachelor" }`
5. `setUrlState` is called with:
   ```typescript
   {
     type: null,                           // Clears this param
     courseLevelPreference: "bachelor",    // Keeps this param
     page: 0
   }
   ```
6. **URL becomes `?courseLevelPreference=bachelor`** ✅

## Why This Works

The nuqs library requires explicit `null` values to remove URL parameters. By spreading `currentFilterColumns` (all set to `null`) first, and then spreading `filterParams` (with the new values), we ensure:

1. **All old filters are cleared** (set to null)
2. **New filters overwrite the null values** (because of spread order)
3. **The URL stays perfectly in sync** with the filter state

## Impact

- ✅ Adding filters now works correctly
- ✅ Removing filters now works correctly
- ✅ Changing filters (e.g., from "internal" to "external") works correctly
- ✅ Clearing all filters works correctly
- ✅ URL parameters match the actual filter state

## Files Modified

1. `features/lecturers/components/data-table/data-table.tsx`
2. `features/courses/components/data-table/data-table.tsx`

Both files had the same issue and received the same fix.
