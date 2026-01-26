'use client'

import { RefreshCwIcon, XIcon } from 'lucide-react'
import { useEffect, useState, useTransition } from 'react'

import { CreateDialog } from '@/features/lecturers/components/dialog/create'
import { DataTableFacetedFilter } from '@/features/shared/components/data-table-faceted-filter'
import { DataTablePagination } from '@/features/shared/components/data-table-pagination'
import { DataTableViewOptions } from '@/features/shared/components/data-table-view-options'
import { Button } from '@/features/shared/components/ui/button'
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

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  refreshAction?: () => Promise<TData[]>
}

export function DataTable<TData, TValue>({
  columns,
  data,
  refreshAction,
}: DataTableProps<TData, TValue>) {
  const [isPending, startTransition] = useTransition()
  const [tableData, setTableData] = useState<TData[]>(data)

  useEffect(() => {
    setTableData(data)
  }, [data])

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState<string>('')
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [isDialogOpen, setDialogOpen] = useState(false)

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: tableData,
    columns,

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

  const prefColumn = table.getColumn('courseLevelPreference')
  const prefUniqueValues = prefColumn?.getFacetedUniqueValues()

  const prefCounts = new Map<string, number>()
  if (prefUniqueValues) {
    const both = prefUniqueValues.get('both') ?? 0
    const bachelor = prefUniqueValues.get('bachelor') ?? 0
    const master = prefUniqueValues.get('master') ?? 0

    prefCounts.set('bachelor', bachelor + both)
    prefCounts.set('master', master + both)
  }

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
          <DataTableFacetedFilter
            title={'Typ'}
            options={[
              {
                value: 'internal',
                label: 'Intern',
              },
              {
                value: 'external',
                label: 'Extern',
              },
            ]}
            column={table.getColumn('type')}
          />
          <DataTableFacetedFilter
            title={'Präferenz'}
            options={[
              {
                value: 'bachelor',
                label: 'Bachelor',
              },
              {
                value: 'master',
                label: 'Master',
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
                table.setGlobalFilter('')
              }}>
              <XIcon />
              <span className={'sr-only'}>Filter löschen</span>
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <DataTableViewOptions table={table} />
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            type="button"
            disabled={isPending}
            onClick={() => {
              startTransition(async () => {
                if (refreshAction) {
                  const newData = await refreshAction()
                  setTableData(newData)
                }
              })
            }}>
            <RefreshCwIcon
              className={`h-4 w-4 ${isPending ? 'animate-spin' : ''}`}
            />
            <span className={'sr-only'}>Daten aktualisieren</span>
          </Button>
          <Button onClick={() => setDialogOpen(true)} suppressHydrationWarning>
            Dozent erstellen
          </Button>
          <CreateDialog open={isDialogOpen} onOpenChange={setDialogOpen} />
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
