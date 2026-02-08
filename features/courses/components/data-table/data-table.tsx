'use client'

import { Plus, RefreshCwIcon, XIcon } from 'lucide-react'
import { useEffect, useRef, useState, useTransition } from 'react'
import * as React from 'react'
import { toast } from 'sonner'
import { z } from 'zod'

import { createCourse } from '@/features/courses/actions/create-course'
import { deleteCourse } from '@/features/courses/actions/delete-course'
import { deleteCourses } from '@/features/courses/actions/delete-courses'
import { getCourses } from '@/features/courses/actions/get-courses'
import { updateCourse } from '@/features/courses/actions/update-course'
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
  ColumnFiltersState,
  OnChangeFn,
  PaginationState,
  RowSelectionState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'

export function DataTable({
  initialData,
}: {
  initialData: GetCoursesResponse
}) {
  const [isPending, startTransition] = useTransition()

  // Table state
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState<string>('')
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  // Debounce global filter
  const [inputValue, setInputValue] = useState<string>(globalFilter)
  const debouncedInputValue = useDebounce(inputValue)
  const skipNextDebouncedUpdate = useRef(false)

  useEffect(() => {
    if (skipNextDebouncedUpdate.current) {
      skipNextDebouncedUpdate.current = false
      return
    }
    if (debouncedInputValue !== globalFilter) {
      setGlobalFilter(debouncedInputValue)
      setPagination((prev) => ({ ...prev, pageIndex: 0 }))
    }
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
      setRowSelection({})
      setData(result.data)
      setPageCount(result.pageCount)
      setRowCount(result.rowCount)
    })
  }

  const isMounted = useRef(false)
  const skipNextFetch = useRef(false)

  useEffect(() => {
    if (isMounted.current) {
      if (skipNextFetch.current) {
        skipNextFetch.current = false
        return
      }
      fetchData()
    } else {
      isMounted.current = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination, sorting, globalFilter])

  const handleCreate = (data: z.infer<typeof courseSchema>) => {
    const promise = createCourse(data).then(() => fetchData())

    toast.promise(promise, {
      loading: 'Vorlesung wird erstellt...',
      success: 'Erfolgreich Vorlesung erstellt',
      error: 'Fehler beim Erstellen der Vorlesung',
    })
  }

  const handleUpdate = (id: string, data: z.infer<typeof courseSchema>) => {
    const promise = updateCourse(id, data).then(() => fetchData())

    toast.promise(promise, {
      loading: 'Vorlesung wird aktualisiert...',
      success: 'Erfolgreich Vorlesung aktualisiert',
      error: 'Fehler beim Aktualisieren der Vorlesung',
    })
  }

  const handleDelete = (id: string) => {
    const promise = deleteCourse(id).then(() => fetchData())

    toast.promise(promise, {
      loading: 'Vorlesung wird gelöscht...',
      success: 'Erfolgreich Vorlesung gelöscht',
      error: 'Fehler beim Löschen der Vorlesung',
    })
  }

  const handleDeleteMany = (ids: string[]) => {
    const promise = deleteCourses(ids).then(() => fetchData())

    toast.promise(promise, {
      loading: 'Vorlesungen werden gelöscht...',
      success: 'Erfolgreich Vorlesungen gelöscht',
      error: 'Fehler beim Löschen der Vorlesungen',
    })
  }

  const handleRefresh = () => {
    fetchData()
  }

  const handleClearFilters = () => {
    const nextPagination = { ...pagination, pageIndex: 0 }

    skipNextFetch.current = true
    skipNextDebouncedUpdate.current = true
    setColumnFilters([])
    setGlobalFilter('')
    setInputValue('')
    setPagination(nextPagination)

    fetchData(nextPagination, sorting, '')
  }

  const onColumnFiltersChange: OnChangeFn<ColumnFiltersState> = (
    updaterOrValue
  ) => {
    setColumnFilters(updaterOrValue)
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }

  const onGlobalFilterChange: OnChangeFn<string> = (updaterOrValue) => {
    setGlobalFilter(updaterOrValue)
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
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
      refreshCourses: handleRefresh,
    },

    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: onColumnFiltersChange,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: onGlobalFilterChange,
    onPaginationChange: setPagination,

    getCoreRowModel: getCoreRowModel(),
    autoResetPageIndex: false,

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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex w-full flex-wrap items-center gap-2">
          <div className="flex w-full gap-2 md:w-64">
            {/** Desktop only: Show input only */}
            <Input
              className={'hidden md:flex'}
              placeholder="Vorlesungen suchen..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
          </div>
          {/** Mobile only: Show input, view options and refresh button */}
          <ButtonGroup className={'w-full flex-1 md:hidden'}>
            <Input
              placeholder="Vorlesungen suchen..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <DataTableViewOptions table={table} />
            <Button
              variant="outline"
              size="icon"
              type="button"
              disabled={isPending}
              suppressHydrationWarning
              onClick={handleRefresh}>
              <RefreshCwIcon className={isPending ? 'animate-spin' : ''} />
              <span className={'sr-only'}>Daten aktualisieren</span>
            </Button>
          </ButtonGroup>
          {/** Mobile only: Show small create button next to searchbar */}
          <div className={'flex md:hidden'}>
            <CourseDialog
              trigger={
                <Button suppressHydrationWarning size={'icon'}>
                  <Plus />
                  <span className={'sr-only'}>Vorlesung erstellen</span>
                </Button>
              }
              onSubmit={handleCreate}
            />
          </div>
          {/** REPLACE THIS DIV WITH FACETED FILTERS ONCE IMPLEMENTED */}
          {/** This div's only purpose is to push the clear filters button to the bottom on mobile, when no faceted filters are present */}
          <div className={'w-full h-0 md:hidden'} />
          {(table.getState().columnFilters.length > 0 || globalFilter) && (
            <Button
              variant="ghost"
              size={'icon'}
              onClick={handleClearFilters}
              suppressHydrationWarning>
              <XIcon />
              <span className={'sr-only'}>Filter löschen</span>
            </Button>
          )}
        </div>
        {/** Desktop only: Show view options, refresh button and create button on the right */}
        <div className={'hidden md:flex gap-2'}>
          <ButtonGroup>
            <DataTableViewOptions table={table} />
            <Button
              variant="outline"
              size="icon"
              type="button"
              disabled={isPending}
              suppressHydrationWarning
              onClick={handleRefresh}>
              <RefreshCwIcon className={isPending ? 'animate-spin' : ''} />
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
