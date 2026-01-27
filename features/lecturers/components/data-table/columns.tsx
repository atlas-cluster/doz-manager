'use client'

import { LecturerDialog } from '../dialog'
import {
  ArrowUpDown,
  MoreHorizontalIcon,
  PencilIcon,
  TrashIcon,
} from 'lucide-react'
import { useState } from 'react'

import { LecturerCourseLevelPreferenceBadge } from '@/features/lecturers/components/lecturer-course-level-preference-badge'
import { LecturerTypeBadge } from '@/features/lecturers/components/lecturer-type-badge'
import { Lecturer } from '@/features/lecturers/types'
import { LecturerTableMeta } from '@/features/lecturers/types'
import { Button } from '@/features/shared/components/ui/button'
import { Checkbox } from '@/features/shared/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/features/shared/components/ui/dropdown-menu'
import { ColumnDef, Row, Table } from '@tanstack/table-core'

function ActionsCell({
  row,
  table,
}: {
  row: Row<Lecturer>
  table: Table<Lecturer>
}) {
  const meta = table.options.meta as LecturerTableMeta | undefined
  const lecturer = row.original
  const [open, setOpen] = useState(false)

  const selectedRows = table.getPreFilteredRowModel().rows
  return (
    <div className="flex justify-end">
      <LecturerDialog
        lecturer={lecturer}
        open={open}
        onOpenChange={setOpen}
        onSubmit={(payload) => meta?.updateLecturer?.(lecturer.id, payload)}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size={'icon'} suppressHydrationWarning>
            <span className={'sr-only'}>Menü öffnen</span>
            <MoreHorizontalIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Aktionen</DropdownMenuLabel>
          {selectedRows.length <= 1 || !row.getIsSelected() ? (
            <>
              <DropdownMenuItem onSelect={() => setOpen(true)}>
                <PencilIcon className="mr-2 h-4 w-4" />
                Bearbeiten
              </DropdownMenuItem>
              <DropdownMenuItem
                variant={'destructive'}
                onSelect={() => meta?.deleteLecturer?.(lecturer.id)}>
                <TrashIcon className="mr-2 h-4 w-4" />
                Löschen
              </DropdownMenuItem>
            </>
          ) : (
            <>
              <DropdownMenuItem
                variant={'destructive'}
                onSelect={() =>
                  meta?.deleteLecturers?.(
                    selectedRows.map((r) => r.original.id)
                  )
                }>
                <TrashIcon className="mr-2 h-4 w-4" />
                Löschen ({selectedRows.length})
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export const columns: ColumnDef<Lecturer>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    enableGlobalFilter: false,
  },
  {
    accessorFn: (row) =>
      `${row.title ? row.title : ''} ${row.firstName} ${row.secondName ? row.secondName : ''} ${row.lastName}`,
    id: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    sortingFn: (rowA, rowB) => {
      return rowA.original.lastName.localeCompare(rowB.original.lastName)
    },
    enableSorting: true,
    enableHiding: false,
    enableGlobalFilter: true,
  },
  {
    accessorKey: 'email',
    id: 'email',
    header: 'E-Mail',
    enableSorting: false,
    enableHiding: true,
    enableGlobalFilter: true,
  },
  {
    accessorKey: 'phone',
    header: 'Telefonnummer',
    enableSorting: false,
    enableHiding: true,
    enableGlobalFilter: true,
  },
  {
    accessorKey: 'type',
    header: 'Typ',
    cell: ({ row }) => {
      return <LecturerTypeBadge type={row.original.type} />
    },
    enableSorting: false,
    enableHiding: true,
    enableGlobalFilter: false,
  },
  {
    accessorKey: 'courseLevelPreference',
    header: 'Vorlesungspräferenz',
    cell: ({ row }) => {
      return (
        <LecturerCourseLevelPreferenceBadge
          pref={row.original.courseLevelPreference}
        />
      )
    },
    filterFn: (row, id, value: string[]) => {
      const rowValue = row.getValue(id) as string
      const wantsBachelor = value.includes('bachelor')
      const wantsMaster = value.includes('master')

      if (wantsBachelor && wantsMaster) {
        return rowValue === 'both'
      }

      if (wantsBachelor) {
        return rowValue === 'bachelor' || rowValue === 'both'
      }

      if (wantsMaster) {
        return rowValue === 'master' || rowValue === 'both'
      }

      return true
    },
    enableSorting: false,
    enableHiding: true,
    enableGlobalFilter: false,
  },
  {
    id: 'actions',
    cell: ({ row, table }) => {
      return <ActionsCell row={row} table={table} />
    },
    enableSorting: false,
    enableHiding: false,
    enableGlobalFilter: false,
  },
]
