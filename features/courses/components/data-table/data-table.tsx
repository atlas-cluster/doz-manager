'use client'

import { RefreshCwIcon, XIcon } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { z } from 'zod'

import { createCourse } from '@/features/courses/actions/create'
import { deleteCourse } from '@/features/courses/actions/delete'
import { deleteCourses } from '@/features/courses/actions/delete-many'
import { getCourses } from '@/features/courses/actions/get'
import { updateCourse } from '@/features/courses/actions/update'
import { columns } from '@/features/courses/components/data-table/columns'
import { CourseDialog } from '@/features/courses/components/dialog'
import { courseSchema } from '@/features/courses/schemas/course'
import { Course, GetCoursesResponse } from '@/features/courses/types'
import { DataTablePagination } from '@/features/shared/components/data-table-pagination'
import { DataTableViewOptions } from '@/features/shared/components/data-table-view-options'
import { Button } from '@/features/shared/components/ui/button'
import { ButtonGroup } from '@/features/shared/components/ui/button-group'
import { Input } from '@/features/shared/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/features/shared/components/ui/table'
import { useDebounce } from '@/features/shared/hooks/use-debounce'
import {
  parseFiltersFromUrlParams,
  serializeFiltersToUrlParams,
  useTableUrlState,
} from '@/features/shared/hooks/use-table-url-state'
import {
  ColumnFiltersState,
  OnChangeFn,
  PaginationState,
  RowSelectionState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'

export function DataTable({
  initialData,
}: {
  initialData: GetCoursesResponse
}) {
  const [isPending, startTransition] = useTransition()

  // URL state management with nuqs
  const [urlState, setUrlState] = useTableUrlState()
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  // Derive sorting state from URL
  const sorting: SortingState =
    urlState.sortBy && urlState.sortOrder
      ? [{ id: urlState.sortBy, desc: urlState.sortOrder === 'desc' }]
      : []

  const setSorting = (
    updaterOrValue: SortingState | ((old: SortingState) => SortingState)
  ) => {
    const newSorting =
      typeof updaterOrValue === 'function'
        ? updaterOrValue(sorting)
        : updaterOrValue

    if (newSorting.length > 0) {
      setUrlState({
        sortBy: newSorting[0].id,
        sortOrder: newSorting[0].desc ? 'desc' : 'asc',
      })
    } else {
      setUrlState({
        sortBy: null,
        sortOrder: null,
      })
    }
  }

  // Pagination state from URL
  const pagination: PaginationState = {
    pageIndex: urlState.page,
    pageSize: urlState.pageSize,
  }

  const setPagination = (
    updaterOrValue:
      | PaginationState
      | ((old: PaginationState) => PaginationState)
  ) => {
    const newPagination =
      typeof updaterOrValue === 'function'
        ? updaterOrValue(pagination)
        : updaterOrValue

    setUrlState({
      page: newPagination.pageIndex,
      pageSize: newPagination.pageSize,
    })
  }

  // Global filter from URL
  const globalFilter = urlState.search

  const setGlobalFilter = (value: string) => {
    setUrlState({
      search: value || null,
      page: 0, // Reset to first page on search
    })
  }

  // Column filters from URL - parse all non-standard params
  const columnFilters: ColumnFiltersState = useMemo(() => {
    const params: Record<string, string | string[] | null> = {}
    const standardParams = new Set([
      'page',
      'pageSize',
      'sortBy',
      'sortOrder',
      'search',
    ])

    searchParams.forEach((value, key) => {
      if (!standardParams.has(key)) {
        const existing = params[key]
        if (existing === null || existing === undefined) {
          params[key] = value
        } else if (Array.isArray(existing)) {
          existing.push(value)
        } else {
          params[key] = [existing, value]
        }
      }
    })

    return parseFiltersFromUrlParams(params)
  }, [searchParams])

  const setColumnFilters = (
    updaterOrValue:
      | ColumnFiltersState
      | ((old: ColumnFiltersState) => ColumnFiltersState)
  ) => {
    const newFilters =
      typeof updaterOrValue === 'function'
        ? updaterOrValue(columnFilters)
        : updaterOrValue

    // Build new URL with updated filters using Next.js router
    const params = new URLSearchParams(searchParams.toString())

    const standardParamsSet = new Set([
      'page',
      'pageSize',
      'sortBy',
      'sortOrder',
      'search',
    ])

    if (newFilters.length === 0) {
      // When clearing ALL filters (reset button), delete ALL non-standard params from URL
      const keysToDelete: string[] = []
      params.forEach((_, key) => {
        if (!standardParamsSet.has(key)) {
          keysToDelete.push(key)
        }
      })
      keysToDelete.forEach((key) => params.delete(key))
    } else {
      // When updating filters normally, clear old ones and add new ones
      columnFilters.forEach((filter) => {
        params.delete(filter.id)
      })

      // Serialize and add new filters
      const filterParams = serializeFiltersToUrlParams(newFilters)
      Object.entries(filterParams).forEach(([key, value]) => {
        if (value) {
          params.set(key, value)
        }
      })
    }

    // Reset to first page on filter change (page will be omitted from URL if on first page)
    params.delete('page') // Remove page param to go back to first page

    // Build query string manually to avoid encoding commas in filter values
    const standardParams = new Set([
      'page',
      'pageSize',
      'sortBy',
      'sortOrder',
      'search',
    ])
    const queryParts: string[] = []

    params.forEach((value, key) => {
      if (standardParams.has(key)) {
        // Standard params - encode normally
        queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      } else {
        // Filter params - don't encode commas in values for cleaner URLs
        queryParts.push(`${encodeURIComponent(key)}=${value}`)
      }
    })

    const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : ''

    // Update URL using router
    router.push(`${pathname}${queryString}`, { scroll: false })
  }

  // Local state for things that don't need to be in URL
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  // Debounce input for better UX
  const [inputValue, setInputValue] = useState<string>(globalFilter)
  const debouncedInputValue = useDebounce(inputValue)

  useEffect(() => {
    if (debouncedInputValue !== globalFilter) {
      setGlobalFilter(debouncedInputValue)
    }
    // setGlobalFilter uses setUrlState which is stable from nuqs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedInputValue, globalFilter])

  // Table data
  const [data, setData] = useState<Course[]>(initialData.data)
  const [pageCount, setPageCount] = useState<number>(initialData.pageCount)
  const [rowCount, setRowCount] = useState<number>(initialData.rowCount)

  const fetchData = (
    currentPagination = pagination,
    currentSorting = sorting,
    currentGlobal = globalFilter
  ) => {
    startTransition(async () => {
      const result = await getCourses({
        pageIndex: currentPagination.pageIndex,
        pageSize: currentPagination.pageSize,
        sorting: currentSorting as { id: string; desc: boolean }[],
        globalFilter: currentGlobal,
      })
      setData(result.data)
      setPageCount(result.pageCount)
      setRowCount(result.rowCount)
    })
  }

  const isMounted = useRef(false)

  useEffect(() => {
    if (isMounted.current) {
      fetchData()
      // Clear row selection when navigating (page, filters, sorting, search changes)
      setRowSelection({})
    } else {
      isMounted.current = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    urlState.page,
    urlState.pageSize,
    urlState.sortBy,
    urlState.sortOrder,
    urlState.search,
    columnFilters,
  ])

  const handleCreate = (data: z.infer<typeof courseSchema>) => {
    startTransition(async () => {
      await createCourse(data)
      fetchData()
    })
  }

  const handleUpdate = (id: string, data: z.infer<typeof courseSchema>) => {
    startTransition(async () => {
      await updateCourse(id, data)
      fetchData()
    })
  }

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteCourse(id)
      fetchData()
    })
  }

  const handleDeleteMany = (ids: string[]) => {
    startTransition(async () => {
      await deleteCourses(ids)
      fetchData()
      setRowSelection({})
    })
  }

  const handleRefresh = () => {
    fetchData()
  }

  const onColumnFiltersChange: OnChangeFn<ColumnFiltersState> = (
    updaterOrValue
  ) => {
    setColumnFilters(updaterOrValue)
  }

  const onGlobalFilterChange: OnChangeFn<string> = (updaterOrValue) => {
    const newValue =
      typeof updaterOrValue === 'function'
        ? updaterOrValue(globalFilter)
        : updaterOrValue
    setGlobalFilter(newValue)
  }

  const table = useReactTable({
    data,
    columns,
    pageCount,
    rowCount,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,

    meta: {
      createCourse: handleCreate,
      updateCourse: handleUpdate,
      deleteCourse: handleDelete,
      deleteCourses: handleDeleteMany,
      refreshCourse: handleRefresh,
    },

    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: onColumnFiltersChange,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: onGlobalFilterChange,
    onPaginationChange: setPagination,

    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    autoResetPageIndex: false,

    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),

    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
      pagination,
    },
  })

  return (
    <div className="w-full space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full flex-wrap items-center gap-2">
          <Input
            className="h-9 w-full sm:w-65"
            placeholder="Vorlesungen suchen..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          {(table.getState().columnFilters.length > 0 || globalFilter) && (
            <Button
              variant="ghost"
              size={'icon'}
              onClick={() => {
                setColumnFilters([])
                setInputValue('')
                setGlobalFilter('')
              }}>
              <XIcon />
              <span className={'sr-only'}>Filter löschen</span>
            </Button>
          )}
        </div>
        <ButtonGroup>
          <DataTableViewOptions table={table} />
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            type="button"
            disabled={isPending}
            suppressHydrationWarning
            onClick={handleRefresh}>
            <RefreshCwIcon
              className={`h-4 w-4 ${isPending ? 'animate-spin' : ''}`}
            />
            <span className={'sr-only'}>Daten aktualisieren</span>
          </Button>
        </ButtonGroup>
        <CourseDialog
          trigger={
            <Button suppressHydrationWarning>Vorlesung erstellen</Button>
          }
          onSubmit={handleCreate}
        />
      </div>
      <div className="overflow-hidden rounded-md border mb-3">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center">
                  Keine Vorlesungen gefunden.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  )
}
