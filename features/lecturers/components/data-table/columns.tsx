'use client'

import {
  ArrowUpDown,
  MoreHorizontalIcon,
  PencilIcon,
  TrashIcon,
} from 'lucide-react'

import { deleteLecturer } from '@/features/lecturers/actions/delete'
import { LecturerCourseLevelPreferenceBadge } from '@/features/lecturers/components/lecturer-course-level-preference-badge'
import { LecturerTypeBadge } from '@/features/lecturers/components/lecturer-type-badge'
import { Lecturer } from '@/features/lecturers/types'
import { Button } from '@/features/shared/components/ui/button'
import { Checkbox } from '@/features/shared/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/features/shared/components/ui/dropdown-menu'
import { ColumnDef } from '@tanstack/table-core'

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
    enableSorting: true,
    enableHiding: false,
    enableGlobalFilter: true,
  },
  {
    accessorKey: 'email',
    id: 'email',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    enableSorting: true,
    enableHiding: false,
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
    enableSorting: false,
    enableHiding: false,
    enableGlobalFilter: false,
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      return (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size={'icon'} suppressHydrationWarning>
                <span className={'sr-only'}>Menü öffnen</span>
                <MoreHorizontalIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Aktionen</DropdownMenuLabel>
              <DropdownMenuItem>
                <PencilIcon />
                Bearbeiten
              </DropdownMenuItem>
              <DropdownMenuItem
                variant={'destructive'}
                onSelect={() => deleteLecturer(row.original.id)}>
                <TrashIcon />
                Löschen
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
    enableGlobalFilter: false,
  },
]
