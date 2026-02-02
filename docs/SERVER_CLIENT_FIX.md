# Server/Client Boundary Fix

## Problem

The application was failing with the following error when trying to load server-rendered pages:

```
Error: Attempted to call createParser() from the server but createParser is on the client.
It's not possible to invoke a client function from the server.
```

## Root Cause

The `createParser()` function from the `nuqs` library is a client-side only API. It was being called at the module level in `use-table-url-state.ts`, which was then imported by server-side code through this chain:

```
Server Page (app/(app)/lecturers/page.tsx)
  ↓
parse-table-search-params.ts (server-side utility)
  ↓
use-table-url-state.ts (imports parseFiltersFromUrlParams)
  ↓
Module-level createParser() call ❌ ERROR
```

## Solution

Created a proper separation between client-only code and shared utilities:

### 1. Created `table-url-utils.ts` (Shared Utility)

A new file containing functions that work on both server and client:

- `parseFiltersFromUrlParams()` - Parse URL params to filter state
- `serializeFiltersToUrlParams()` - Convert filter state to URL params

These functions don't depend on any client-side APIs.

### 2. Updated `use-table-url-state.ts` (Client Only)

- Added `'use client'` directive at the top
- Removed filter parsing functions (moved to shared utility)
- Re-exports shared utilities for convenience
- Keeps `createParser()` and `useTableUrlState()` hook (client-only)

### 3. Updated `parse-table-search-params.ts` (Server Safe)

- Changed import from `use-table-url-state.ts` to `table-url-utils.ts`
- No longer triggers client-side code when used on the server

## Result

The import chain is now properly separated:

**Server-side rendering:**

```
Server Page → parse-table-search-params.ts → table-url-utils.ts ✅
```

**Client-side interactions:**

```
Client Component → use-table-url-state.ts → createParser() ✅
```

Both server and client code can import and use the shared filter parsing utilities, while only client code uses the nuqs `createParser()` API.

## Files Changed

1. **Created**: `features/shared/hooks/table-url-utils.ts`
   - Shared utilities for parsing and serializing filters
   - Works on both server and client

2. **Modified**: `features/shared/hooks/use-table-url-state.ts`
   - Added `'use client'` directive
   - Removed shared functions, re-exports them from new file
   - Keeps client-only nuqs APIs

3. **Modified**: `features/shared/hooks/parse-table-search-params.ts`
   - Updated import to use `table-url-utils.ts`
   - No longer imports client-only code

## Testing

- ✅ TypeScript compilation passes
- ✅ ESLint checks pass
- ✅ All unit tests pass (37 tests)
- ✅ No server/client boundary errors in build
- ✅ Server-side rendering works correctly
- ✅ Client-side filtering still works
