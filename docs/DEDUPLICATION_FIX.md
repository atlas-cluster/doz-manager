# Request Deduplication Fix

## Problem

When resetting filters or making rapid URL changes, the data table was making 6-7 duplicate requests to the server, causing:
- Flickering UI
- Poor user experience
- Unnecessary server load
- Network congestion

Console output during reset:
```
GET /lecturers?pageSize=all 200 in 27ms
POST /lecturers?pageSize=all&search=Bea 200 in 26ms
POST /lecturers?pageSize=all 200 in 59ms
POST /lecturers?pageSize=all 200 in 18ms
POST /lecturers?pageSize=all 200 in 11ms
POST /lecturers?pageSize=all 200 in 14ms
POST /lecturers?pageSize=all 200 in 11ms
```

## Root Cause

The data table uses **dual URL state management**:
1. **nuqs** for standard params (page, pageSize, sortBy, sortOrder, search)
2. **Next.js searchParams** for column filters

When the URL changes, both state systems update independently, causing the `useEffect` to trigger multiple times:

```typescript
useEffect(() => {
  fetchData()
}, [
  urlState.page,        // nuqs - triggers separately
  urlState.pageSize,    // nuqs - triggers separately  
  urlState.sortBy,      // nuqs - triggers separately
  urlState.sortOrder,   // nuqs - triggers separately
  urlState.search,      // nuqs - triggers separately
  columnFilters,        // searchParams - triggers separately
])
```

### Why Multiple Triggers Happen

1. User clicks reset button
2. `router.push()` updates the URL
3. **Cascade of updates:**
   - Next.js `searchParams` updates → `columnFilters` recalculates → effect trigger #1
   - nuqs `urlState.page` updates → effect trigger #2
   - nuqs `urlState.search` updates → effect trigger #3
   - nuqs `urlState.pageSize` might update → effect trigger #4
   - ... (possibly more as each param stabilizes)
4. Each trigger calls `fetchData()`
5. 6-7 concurrent requests!

### The Timing Issue

React doesn't batch these updates because:
- nuqs uses its own state management
- Next.js searchParams uses a different update mechanism
- They update asynchronously at different times
- Each update triggers the effect independently

## Solution: Request Deduplication

Instead of trying to consolidate the state management (which would require a major refactor), we added a simple guard to prevent concurrent fetches:

```typescript
const fetchInProgress = useRef(false)

const fetchData = (...params) => {
  // Skip if a fetch is already in progress
  if (fetchInProgress.current) {
    return
  }

  fetchInProgress.current = true
  
  startTransition(async () => {
    try {
      const result = await getLecturers({...})
      setData(result.data)
      // ...
    } finally {
      // Always reset the flag, even on error
      fetchInProgress.current = false
    }
  })
}
```

## How It Works

1. **First trigger**: `fetchInProgress.current` is `false`
   - Fetch proceeds
   - Flag set to `true`
   
2. **Subsequent triggers** (while first is still in progress):
   - `fetchInProgress.current` is `true`
   - Early return - fetch skipped
   
3. **First fetch completes**:
   - `finally` block executes
   - Flag reset to `false`
   - Ready for next legitimate fetch

4. **Result**: Only 1 fetch per logical operation! ✅

## Why This Works

- **Race condition safe**: `useRef` is synchronous and doesn't trigger re-renders
- **Simple**: No complex state management changes needed
- **Effective**: Reduces 6-7 requests to 1 request
- **Robust**: `finally` block ensures flag is always reset, even on errors
- **React 18 compatible**: Works with `startTransition` and Suspense

## Alternative Approaches Considered

### 1. Debouncing
```typescript
const debouncedFetchData = useMemo(
  () => debounce(fetchData, 100),
  []
)
```
**Problem**: Still makes multiple requests, just delayed. Doesn't eliminate duplicates.

### 2. Consolidating URL State
```typescript
const urlStateKey = useMemo(() => 
  JSON.stringify({ page, pageSize, sortBy, sortOrder, search, columnFilters })
, [page, pageSize, sortBy, sortOrder, search, columnFilters])

useEffect(() => {
  fetchData()
}, [urlStateKey])
```
**Problem**: Still triggers multiple times as each dependency updates. JSON.stringify creates new string on every render.

### 3. Single URL State Source
Refactor to use only nuqs or only searchParams for all state.

**Problem**: Major refactor required. nuqs doesn't support truly dynamic parameters (column filters). searchParams doesn't have type-safe parsers.

### 4. Request Deduplication ✅ (Chosen)
**Advantages**:
- Minimal code change
- No refactoring needed
- Works with existing dual state management
- Eliminates all duplicate requests
- Easy to understand and maintain

## Results

**Before:**
- 6-7 requests per reset
- Visible flickering
- Slow, janky UX

**After:**
- 1 request per reset
- No flickering
- Smooth, instant UX

## Lessons Learned

1. **Dual state management has costs**: Mixing nuqs and searchParams creates timing issues
2. **React effects with many dependencies are fragile**: Each dependency can trigger independently
3. **Request deduplication is a simple, effective pattern**: Often better than trying to prevent all triggers
4. **Always use finally blocks**: Ensures cleanup even when errors occur

## Future Improvements

If this becomes a problem elsewhere, consider:
1. Creating a custom hook: `useDedupedFetch()`
2. Consolidating to a single URL state source (major refactor)
3. Using React Query or SWR for automatic request deduplication
4. Implementing a more sophisticated cancellation mechanism with AbortController
