# Reset Button Fix - Column Filters Not Clearing

## Problem

The reset button (X icon) was not clearing column filters from the URL, even though it cleared the global search filter.

## Root Cause: Race Condition Between URL Updates

The reset button's `onClick` handler was calling multiple functions that each tried to update the URL:

```typescript
onClick={() => {
  setColumnFilters([])    // Updates URL via router.push()
  setInputValue('')
  setGlobalFilter('')     // Updates URL via nuqs setUrlState()
}}
```

### The Issue

1. **First update**: `setColumnFilters([])` uses Next.js `router.push()` to update the URL
2. **Second update**: `setGlobalFilter('')` uses nuqs's `setUrlState()` to update the URL
3. These updates happen **asynchronously** and can conflict
4. The nuqs `setUrlState` might read the old URL before the router update completes
5. This creates a **race condition** where column filter params don't get removed

### Why This Happened

We were mixing two different URL update mechanisms:
- **router.push()** from Next.js (used by `setColumnFilters`)
- **setUrlState()** from nuqs (used by `setGlobalFilter`)

When both try to update the URL simultaneously, they can overwrite each other's changes.

## Solution: Single Atomic URL Update

Instead of calling multiple setter functions, the reset button now performs **one single URL update**:

```typescript
onClick={() => {
  // Clear all filters and search in one URL update to avoid race conditions
  const params = new URLSearchParams(searchParams.toString())
  
  // Keep only standard params (pageSize, sortBy, sortOrder if they exist)
  const standardParamsSet = new Set(['pageSize', 'sortBy', 'sortOrder'])
  const keysToDelete: string[] = []
  params.forEach((_, key) => {
    if (!standardParamsSet.has(key)) {
      keysToDelete.push(key)
    }
  })
  keysToDelete.forEach((key) => params.delete(key))
  
  // Build query string
  const queryParts: string[] = []
  params.forEach((value, key) => {
    queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
  })
  const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : ''
  
  // Clear local state
  setInputValue('')
  
  // Update URL in a single operation
  router.push(`${pathname}${queryString}`, { scroll: false })
}}
```

### How It Works

1. **Read current URL** using `searchParams.toString()`
2. **Identify params to delete**: Everything that's not in `['pageSize', 'sortBy', 'sortOrder']`
3. **Delete non-standard params**: This removes `page`, `search`, and all column filter params
4. **Build clean query string** from remaining params
5. **Update URL once** using `router.push()` - no race condition!

### What Gets Preserved vs Cleared

**Cleared:**
- ✅ All column filters (`type`, `courseLevelPreference`, etc.)
- ✅ Global search (`search` param)
- ✅ Current page (`page` param)

**Preserved:**
- ❌ Page size (`pageSize`)
- ❌ Sort column and direction (`sortBy`, `sortOrder`)

This is intentional - users typically want to keep their preferred page size and sorting even after clearing filters.

## Example

**URL before reset:**
```
/lecturers?page=2&pageSize=20&type=internal&courseLevelPreference=bachelor&search=john&sortBy=lastName&sortOrder=asc
```

**URL after reset:**
```
/lecturers?pageSize=20&sortBy=lastName&sortOrder=asc
```

All filters and search are gone, but page size and sorting are preserved.

## Files Modified

1. `features/lecturers/components/data-table/data-table.tsx`
2. `features/courses/components/data-table/data-table.tsx`

Both files now use the same single-update approach for the reset button.

## Lessons Learned

### Avoid Mixing URL Update Mechanisms

When managing URL state:
- **Choose one mechanism** for URL updates (router.push OR nuqs)
- If using both, ensure updates don't conflict
- Consider consolidating updates into single operations

### URL Update Race Conditions

Multiple asynchronous URL updates can create race conditions:
- Second update might read stale URL
- Updates can overwrite each other
- Solution: Batch updates into single operation

### Atomic State Updates

When resetting multiple pieces of state:
- Combine into single atomic operation when possible
- Reduces race conditions
- More predictable behavior
- Easier to debug
