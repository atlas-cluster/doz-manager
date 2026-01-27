'use client'

import {
  ArrowUpDown,
  MoreHorizontalIcon,
  PencilIcon,
  TrashIcon,
} from 'lucide-react'
import { useState } from 'react'

import { CourseOpenBadge } from '@/features/courses/components/course-open-badge'
import { CourseTableMeta } from '@/features/courses/components/data-table/data-table'
import { CourseDialog } from '@/features/courses/components/dialog'
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

function ActionsCell({
  course,
  meta,
}: {
  course: Course
  meta?: CourseTableMeta
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex justify-end">
      <CourseDialog
        course={course}
        open={open}
        onOpenChange={setOpen}
        onSubmit={(payload) => meta?.updateCourse?.(course.id, payload)}
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
          <DropdownMenuItem onSelect={() => setOpen(true)}>
            <PencilIcon className="mr-2 h-4 w-4" />
            Bearbeiten
          </DropdownMenuItem>
          <DropdownMenuItem
            variant={'destructive'}
            onSelect={() => meta?.deleteCourse?.(course.id)}>
            <TrashIcon className="mr-2 h-4 w-4" />
            Löschen
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

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
    accessorKey: 'semester',
    id: 'semester',
    header: 'Semester',
    enableSorting: false,
    enableHiding: true,
    enableGlobalFilter: false,
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
    header: 'Vorlesungsstufe',
    enableSorting: false,
    enableHiding: true,
    enableGlobalFilter: false,
  },
  {
    id: 'actions',
    cell: ({ row, table }) => {
      const meta = table.options.meta as CourseTableMeta | undefined
      return <ActionsCell course={row.original} meta={meta} />
    },
    enableSorting: false,
    enableHiding: false,
    enableGlobalFilter: false,
  },
]
