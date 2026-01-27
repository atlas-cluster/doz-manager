'use client'

import { RefreshCwIcon, XIcon } from 'lucide-react'
import { useEffect, useState, useTransition } from 'react'
import { z } from 'zod'

import { getCourses } from '@/features/courses'
import { createCourse } from '@/features/courses/actions/create'
import { deleteCourse } from '@/features/courses/actions/delete'
import { deleteCourses } from '@/features/courses/actions/delete-many'
import { updateCourse } from '@/features/courses/actions/update'
import { columns } from '@/features/courses/components/data-table/columns'
import { CourseDialog } from '@/features/courses/components/dialog'
import { courseSchema } from '@/features/courses/schemas/course.schema'
import { Course } from '@/features/courses/types'
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
import {
  ColumnFiltersState,
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

export function DataTable({ data }: { data: Course[] }) {
  const [isPending, startTransition] = useTransition()
  const [tableData, setTableData] = useState<Course[]>(data)

  useEffect(() => {
    setTableData(data)
  }, [data])

  const handleCreate = (data: z.infer<typeof courseSchema>) => {
    startTransition(async () => {
      await createCourse(data)
      const refreshed = await getCourses()
      setTableData(refreshed as Course[])
    })
  }

  const handleUpdate = (id: string, data: z.infer<typeof courseSchema>) => {
    startTransition(async () => {
      await updateCourse(id, data)
      const refreshed = await getCourses()
      setTableData(refreshed as Course[])
    })
  }

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteCourse(id)
      const refreshed = await getCourses()
      setTableData(refreshed as Course[])
    })
  }

  const handleDeleteMany = (ids: string[]) => {
    startTransition(async () => {
      await deleteCourses(ids)
      const refreshed = await getCourses()
      setTableData(refreshed as Course[])
      setRowSelection({})
    })
  }

  const handleRefresh = () => {
    startTransition(async () => {
      const refreshed = await getCourses()
      setTableData(refreshed as Course[])
    })
  }

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState<string>('')
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: tableData,
    columns,

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
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,

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
    },
  })

  return (
    <div className="w-full space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full flex-wrap items-center gap-2">
          <Input
            className="h-9 w-full sm:w-[260px]"
            placeholder="Vorlesungen suchen..."
            value={globalFilter}
            onChange={(e) => table.setGlobalFilter(String(e.target.value))}
          />
          {(table.getState().columnFilters.length > 0 || globalFilter) && (
            <Button
              variant="ghost"
              size={'icon'}
              onClick={() => {
                table.resetColumnFilters()
                table.setGlobalFilter('')
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
          <CourseDialog
            trigger={
              <Button variant={'outline'} suppressHydrationWarning>
                Vorlesung erstellen
              </Button>
            }
            onSubmit={handleCreate}
          />
        </ButtonGroup>
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
