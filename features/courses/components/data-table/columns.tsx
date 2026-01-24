'use client'

import {
  ArrowUpDown,
  MoreHorizontalIcon,
  PencilIcon,
  TrashIcon,
} from 'lucide-react'

import { deleteCourse } from '@/features/courses/actions/delete'
import { CourseOpenBadge } from '@/features/courses/components/course-open-badge'
import { Course } from '@/features/courses/types'
import { LecturerCourseLevelPreferenceBadge } from '@/features/lecturers/components/lecturer-course-level-preference-badge'
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

export const columns: ColumnDef<Course>[] = [
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
    accessorKey: 'name',
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
    accessorKey: 'isOpen',
    id: 'isOpen',
    header: 'Offen',
    cell: ({ row }) => {
      return <CourseOpenBadge isOpen={row.original.isOpen} />
    },
    enableSorting: false,
    enableHiding: true,
    enableGlobalFilter: false,
  },
  {
    accessorKey: 'courseLevel',
    id: 'courseLevel',
    cell: ({ row }) => {
      return (
        <LecturerCourseLevelPreferenceBadge pref={row.original.courseLevel} />
      )
    },
    header: 'Kursstufe',
    enableSorting: false,
    enableHiding: true,
    enableGlobalFilter: false,
  },
  {
    accessorKey: 'semester',
    id: 'semester',
    header: 'Semester',
    enableSorting: false,
    enableHiding: true,
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
                onSelect={() => deleteCourse(row.original.id)}>
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
