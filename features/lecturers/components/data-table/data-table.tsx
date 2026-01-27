'use client'

import { createLecturer } from '../../actions/create'
import { deleteLecturer } from '../../actions/delete'
import { deleteLecturers } from '../../actions/delete-many'
import { getLecturers } from '../../actions/get'
import { updateLecturer } from '../../actions/update'
import { lecturerSchema } from '../../schemas/lecturer.schema'
import { Lecturer } from '../../types'
import { LecturerDialog } from '../dialog'
import { columns } from './columns'
import { RefreshCwIcon, XIcon } from 'lucide-react'
import { useEffect, useState, useTransition } from 'react'
import z from 'zod'

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
  ColumnDef,
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

export function DataTable({ data }: { data: Lecturer[] }) {
  const [isPending, startTransition] = useTransition()
  const [tableData, setTableData] = useState<Lecturer[]>(data)

  useEffect(() => {
    setTableData(data)
  }, [data])

  const handleCreate = (data: z.infer<typeof lecturerSchema>) => {
    startTransition(async () => {
      await createLecturer(data)
      const refreshed = await getLecturers()
      setTableData(refreshed as Lecturer[])
    })
  }

  const handleUpdate = (id: string, data: z.infer<typeof lecturerSchema>) => {
    startTransition(async () => {
      await updateLecturer(id, data)
      const refreshed = await getLecturers()
      setTableData(refreshed as Lecturer[])
    })
  }

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteLecturer(id)
      const refreshed = await getLecturers()
      setTableData(refreshed as Lecturer[])
    })
  }

  const handleDeleteMany = (ids: string[]) => {
    startTransition(async () => {
      await deleteLecturers(ids)
      const refreshed = await getLecturers()
      setTableData(refreshed as Lecturer[])
      setRowSelection({})
    })
  }

  const handleRefresh = () => {
    startTransition(async () => {
      const refreshed = await getLecturers()
      setTableData(refreshed as Lecturer[])
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
      createLecturer: handleCreate,
      updateLecturer: handleUpdate,
      deleteLecturer: handleDelete,
      deleteLecturers: handleDeleteMany,
      refreshLecturer: handleRefresh,
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
            placeholder="Dozenten suchen..."
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
          <LecturerDialog
            trigger={
              <Button variant={'outline'} suppressHydrationWarning>
                Dozent erstellen
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
