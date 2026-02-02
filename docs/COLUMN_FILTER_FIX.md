# Column Filter Button Fix

## Problem

Column filter buttons were not working. When clicking to add or remove filters, the page would rerender but the URL and UI didn't update. The filters would not be added to or removed from the URL.

## Root Cause

The `useTableUrlState` hook uses nuqs's `useQueryStates` with a **predefined schema** that only includes standard parameters (page, pageSize, sortBy, sortOrder, search). When `setUrlState` was called with dynamic column filter params (e.g., `{ type: "internal" }`), **nuqs completely ignored them** because they weren't defined in the schema.

nuqs can ONLY update URL parameters that are explicitly defined in its schema. Dynamic parameters like column filters (which can be any column name) cannot be handled by nuqs.

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

**nuqs is designed for type-safe, predefined parameters**, not dynamic ones. Column filters can be any column name, so we need to bypass nuqs and use the Next.js router directly.

**Strategy:**

- **Standard params** (page, pageSize, sort) → nuqs (type-safe with parsers)
- **Dynamic params** (column filters) → Next.js router (flexible)

By using `URLSearchParams` and `router.push`, we have complete control over the URL and can:

1. **Delete any parameter** by name
2. **Add any parameter** dynamically
3. **Maintain type safety** through our serialization functions
4. **Keep the URL in perfect sync** with filter state

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
