'use client'

import {
  BookOpen,
  Building2,
  GraduationCap,
  RefreshCwIcon,
  VenetianMask,
  XIcon,
} from 'lucide-react'
import { useEffect, useRef, useState, useTransition } from 'react'
import * as React from 'react'
import z from 'zod'

import { createLecturer } from '@/features/lecturers/actions/create'
import { deleteLecturer } from '@/features/lecturers/actions/delete'
import { deleteLecturers } from '@/features/lecturers/actions/delete-many'
import { getLecturers } from '@/features/lecturers/actions/get'
import { updateLecturer } from '@/features/lecturers/actions/update'
import { columns } from '@/features/lecturers/components/data-table/columns'
import { LecturerDialog } from '@/features/lecturers/components/dialog'
import { lecturerSchema } from '@/features/lecturers/schemas/lecturer'
import { GetLecturersResponse, Lecturer } from '@/features/lecturers/types'
import { DataTableFacetedFilter } from '@/features/shared/components/data-table-faceted-filter'
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
  initialData: GetLecturersResponse
}) {
  const [isPending, startTransition] = useTransition()

  // Table State
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
  const debouncedInputValue = useDebounce(inputValue, 300)

  useEffect(() => {
    if (debouncedInputValue !== globalFilter) {
      setGlobalFilter(debouncedInputValue)
      setPagination((prev) => ({ ...prev, pageIndex: 0 }))
    }
  }, [debouncedInputValue, globalFilter])

  // Debounce column filters
  const [committedColumnFilters, setCommittedColumnFilters] =
    useState<ColumnFiltersState>(columnFilters)
  const debouncedColumnFilters = useDebounce(columnFilters, 200)

  useEffect(() => {
    if (debouncedColumnFilters !== committedColumnFilters) {
      setCommittedColumnFilters(debouncedColumnFilters)
      setPagination((prev) => ({ ...prev, pageIndex: 0 }))
    }
  }, [debouncedColumnFilters, committedColumnFilters])

  // Data State
  const [data, setData] = useState<Lecturer[]>(initialData.data)
  const [rowCount, setRowCount] = useState<number>(initialData.rowCount)
  const [pageCount, setPageCount] = useState<number>(initialData.pageCount)
  const [facets, setFacets] = useState(initialData.facets)

  const fetchData = (
    currentPagination = pagination,
    currentSorting = sorting,
    currentFilters = committedColumnFilters,
    currentGlobal = globalFilter
  ) => {
    startTransition(async () => {
      const result = await getLecturers({
        pageIndex: currentPagination.pageIndex,
        pageSize: currentPagination.pageSize,
        sorting: currentSorting as { id: string; desc: boolean }[],
        columnFilters: currentFilters as { id: string; value: unknown }[],
        globalFilter: currentGlobal,
      })
      setData(result.data)
      setRowCount(result.rowCount)
      setPageCount(result.pageCount)
      setFacets(result.facets)
    })
  }

  const isMounted = useRef(false)

  useEffect(() => {
    if (isMounted.current) {
      fetchData()
    } else {
      isMounted.current = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination, sorting, committedColumnFilters, globalFilter])

  const handleCreate = (data: z.infer<typeof lecturerSchema>) => {
    startTransition(async () => {
      await createLecturer(data)
      fetchData()
    })
  }

  const handleUpdate = (id: string, data: z.infer<typeof lecturerSchema>) => {
    startTransition(async () => {
      await updateLecturer(id, data)
      fetchData()
    })
  }

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteLecturer(id)
      fetchData()
    })
  }

  const handleDeleteMany = (ids: string[]) => {
    startTransition(async () => {
      await deleteLecturers(ids)
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
      createLecturer: handleCreate,
      updateLecturer: handleUpdate,
      deleteLecturer: handleDelete,
      deleteLecturers: handleDeleteMany,
      refreshLecturer: handleRefresh,
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

  const prefColumn = table.getColumn('courseLevelPreference')
  // const prefUniqueValues = prefColumn?.getFacetedUniqueValues()

  const prefCounts = new Map<string, number>()
  if (facets.courseLevelPreference) {
    const both = facets.courseLevelPreference['both'] ?? 0
    const bachelor = facets.courseLevelPreference['bachelor'] ?? 0
    const master = facets.courseLevelPreference['master'] ?? 0

    // Logic: 'bachelor' option should include 'bachelor' and 'both' records
    prefCounts.set('bachelor', bachelor + both)
    // Logic: 'master' option should include 'master' and 'both' records
    prefCounts.set('master', master + both)
  }

  const typeCounts = new Map<string, number>()
  if (facets.type) {
    Object.entries(facets.type).forEach(([key, value]) => {
      typeCounts.set(key, value)
    })
  }

  return (
    <div className="w-full space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full flex-wrap items-center gap-2">
          <Input
            className="h-9 w-full sm:w-65"
            placeholder="Dozenten suchen..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <DataTableFacetedFilter
            title={'Typ'}
            options={[
              {
                value: 'internal',
                label: 'Intern',
                icon: Building2,
              },
              {
                value: 'external',
                label: 'Extern',
                icon: VenetianMask,
              },
            ]}
            column={table.getColumn('type')}
            facets={typeCounts}
          />
          <DataTableFacetedFilter
            title={'Präferenz'}
            options={[
              {
                value: 'bachelor',
                label: 'Bachelor',
                icon: BookOpen,
              },
              {
                value: 'master',
                label: 'Master',
                icon: GraduationCap,
              },
            ]}
            column={prefColumn}
            facets={prefCounts}
          />
          {(table.getState().columnFilters.length > 0 || globalFilter) && (
            <Button
              variant="ghost"
              size={'icon'}
              onClick={() => {
                table.resetColumnFilters()
                setInputValue('')
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
        </ButtonGroup>
        <LecturerDialog
          trigger={<Button suppressHydrationWarning>Dozent erstellen</Button>}
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
                  Keine Dozenten gefunden.
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
