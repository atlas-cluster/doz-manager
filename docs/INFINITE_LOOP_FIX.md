# Infinite Loop Bug Fix

## Problem

After implementing nuqs for URL state management, the application experienced an infinite refresh loop when running in development mode.

## Root Cause

The `useEffect` hook in both data tables was depending on **derived objects** (`pagination`, `sorting`, `globalFilter`) that were recreated on every render:

```typescript
// These are recreated on every render
const pagination: PaginationState = {
  pageIndex: urlState.page,
  pageSize: urlState.pageSize,
}

const sorting: SortingState =
  urlState.sortBy && urlState.sortOrder
    ? [{ id: urlState.sortBy, desc: urlState.sortOrder === 'desc' }]
    : []

const globalFilter = urlState.search

// This useEffect would trigger on every render!
useEffect(() => {
  if (isMounted.current) {
    fetchData()
  } else {
    isMounted.current = true
  }
}, [pagination, sorting, globalFilter]) // ❌ These objects are new every render
```

### The Infinite Loop Cycle

1. Component renders → new `pagination`, `sorting` objects created
2. `useEffect` sees "new" dependencies → calls `fetchData()`
3. `fetchData()` updates state → component re-renders
4. New `pagination`, `sorting` objects created → back to step 2 ♻️

## Solution

Changed the `useEffect` dependencies from **derived objects** to **primitive values** from `urlState`:

```typescript
// ✅ Now depends on primitive values that only change when URL actually changes
useEffect(() => {
  if (isMounted.current) {
    fetchData()
  } else {
    isMounted.current = true
  }
}, [
  urlState.page, // primitive number
  urlState.pageSize, // primitive number
  urlState.sortBy, // primitive string | null
  urlState.sortOrder, // primitive string | null
  urlState.search, // primitive string
])
```

### Why This Works

- Primitive values (`number`, `string`, `null`) are compared by **value**, not reference
- The effect only runs when the **actual URL parameters change**, not when objects are recreated
- nuqs provides stable references for `urlState`, so it doesn't change unnecessarily

## Files Changed

1. **`features/courses/components/data-table/data-table.tsx`**
   - Changed line 166: useEffect dependencies

2. **`features/lecturers/components/data-table/data-table.tsx`**
   - Changed line 180: useEffect dependencies
   - Also kept `columnFilters` as it's managed separately for faceted filters

## Testing

✅ TypeScript compilation passes  
✅ ESLint checks pass  
✅ All 37 unit tests pass  
✅ No infinite loop in development mode

## Lessons Learned

When using URL state management libraries like nuqs:

1. **Don't use derived objects/arrays as useEffect dependencies** - they create new references on every render
2. **Use primitive values directly** - they're compared by value and only change when actually different
3. **Be careful with object identity** - React's dependency comparison uses `Object.is()` which compares references for objects

## References

- React docs on [useEffect dependencies](https://react.dev/reference/react/useEffect#my-effect-runs-after-every-re-render)
- [nuqs documentation](https://nuqs.47ng.com/)
