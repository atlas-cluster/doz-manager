import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'

import { Button } from '@/features/shared/components/ui/button'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/features/shared/components/ui/select'
import type { Table } from '@tanstack/react-table'

interface DataTablePaginationProps<TData> {
  table: Table<TData>
}

export function DataTablePagination<TData>({
  table,
}: DataTablePaginationProps<TData>) {
  return (
    <div
      className="flex flex-row items-center justify-between gap-2"
      suppressHydrationWarning>
      <div className="text-muted-foreground text-sm hidden md:flex md:flex-1">
        {table.getFilteredSelectedRowModel().rows.length} von{' '}
        {table.getFilteredRowModel().rows.length} Zeile(n) ausgewählt.
      </div>
      <div className="flex items-center gap-4 lg:gap-8 flex-1 md:justify-end justify-center">
        <div className="flex items-center gap-2 mr-auto md:mr-0">
          <p className="hidden text-sm font-medium md:flex">Zeilen pro Seite</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(v) => table.setPageSize(Number(v))}>
            <SelectTrigger>
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              <SelectGroup>
                <SelectLabel className={'flex md:hidden'}>
                  Zeilen pro Seite
                </SelectLabel>
                {[10, 20, 30, 40, 50, 999999999].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize === 999999999 ? 'Alle' : pageSize}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-25 items-center justify-center text-sm font-medium">
          Seite {table.getState().pagination.pageIndex + 1} von{' '}
          {table.getPageCount()}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            suppressHydrationWarning>
            <span className="sr-only">Gehe zur ersten Seite</span>
            <ChevronsLeft />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}>
            <span className="sr-only">Gehe zur vorherigen Seite</span>
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}>
            <span className="sr-only">Gehe zur nächsten Seite</span>
            <ChevronRight />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}>
            <span className="sr-only">Gehe zur letzten Seite</span>
            <ChevronsRight />
          </Button>
        </div>
      </div>
    </div>
  )
}
