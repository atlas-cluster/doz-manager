'use client'

import {
  ArrowUpDown,
  BookOpen,
  Check,
  GraduationCap,
  Lock,
  MoreHorizontalIcon,
  PencilIcon,
  TrashIcon,
} from 'lucide-react'
import React, { useState } from 'react'

import { CourseDialog } from '@/features/courses/components/dialog'
import { Course, CourseTableMeta } from '@/features/courses/types'
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
  row: Row<Course>
  table: Table<Course>
}) {
  const meta = table.options.meta as CourseTableMeta | undefined
  const course = row.original
  const [open, setOpen] = useState(false)

  const selectedRows = table.getFilteredSelectedRowModel().rows
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
          {selectedRows.length <= 1 || !row.getIsSelected() ? (
            <>
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
            </>
          ) : (
            <>
              <DropdownMenuItem
                variant={'destructive'}
                onSelect={() =>
                  meta?.deleteCourses?.(selectedRows.map((r) => r.original.id))
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
      return (
        <div className={'flex gap-1 items-center'}>
          {row.original.isOpen ? (
            <>
              <Check className={'size-4'} />
              Offen
            </>
          ) : (
            <>
              <Lock className={'size-4'} />
              Geschlossen
            </>
          )}
        </div>
      )
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
        <div className={'flex gap-1 items-center'}>
          {row.original.courseLevel === 'bachelor' ? (
            <>
              <BookOpen className={'size-5'} />
              Bachelor
            </>
          ) : (
            <>
              <GraduationCap className={'size-5'} />
              Master
            </>
          )}
        </div>
      )
    },
    header: 'Vorlesungsstufe',
    enableSorting: false,
    enableHiding: true,
    enableGlobalFilter: false,
  },
  {
    id: 'actions',
    cell: ({ row, table }) => <ActionsCell row={row} table={table} />,
    enableSorting: false,
    enableHiding: false,
    enableGlobalFilter: false,
  },
]
