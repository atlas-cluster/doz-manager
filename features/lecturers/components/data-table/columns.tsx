'use client'

import {
  ArrowDown,
  ArrowLeftRight,
  ArrowUp,
  ArrowUpDown,
  Blend,
  BookOpen,
  Building2,
  GraduationCap,
  MoreHorizontalIcon,
  PencilIcon,
  TrashIcon,
  VenetianMask,
} from 'lucide-react'
import React, { useState } from 'react'

import { CourseAssignmentDialog } from '@/features/lecturers/components/dialog/course-assignment'
import { LecturerDialog } from '@/features/lecturers/components/dialog/lecturer'
import { Lecturer } from '@/features/lecturers/types'
import { LecturerTableMeta } from '@/features/lecturers/types'
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
} from '@/features/shared/components/ui/avatar'
import { Button } from '@/features/shared/components/ui/button'
import { Checkbox } from '@/features/shared/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/features/shared/components/ui/dropdown-menu'
import { initialsFromName } from '@/features/shared/lib/utils'
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
  const [lecturerDialogOpen, setLecturerDialogOpen] = useState(false)
  const [courseAssignmentDialogOpen, setCourseAssignmentDialogOpen] =
    useState(false)

  const selectedRows = table.getFilteredSelectedRowModel().rows
  return (
    <div className="flex justify-end">
      <LecturerDialog
        lecturer={lecturer}
        open={lecturerDialogOpen}
        onOpenChange={setLecturerDialogOpen}
        onSubmit={(payload) => meta?.updateLecturer?.(lecturer.id, payload)}
      />
      <CourseAssignmentDialog
        lecturer={lecturer}
        open={courseAssignmentDialogOpen}
        onOpenChange={setCourseAssignmentDialogOpen}
        onSubmit={() => meta?.refreshLecturers()}
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
              <DropdownMenuItem onSelect={() => setLecturerDialogOpen(true)}>
                <PencilIcon />
                Bearbeiten
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => setCourseAssignmentDialogOpen(true)}>
                <ArrowLeftRight />
                Vorlesungen zuordnen
              </DropdownMenuItem>
              <DropdownMenuItem
                variant={'destructive'}
                onSelect={() => meta?.deleteLecturer?.(lecturer.id)}>
                <TrashIcon />
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
          {column.getIsSorted() === 'asc' ? (
            <ArrowUp className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === 'desc' ? (
            <ArrowDown className="ml-2 h-4 w-4" />
          ) : (
            <ArrowUpDown className="ml-2 h-4 w-4" />
          )}
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
    header: 'Beschäftigungsart',
    cell: ({ row }) => {
      return (
        <div className={'flex gap-1 items-center'}>
          {row.original.type === 'internal' ? (
            <>
              <Building2 className={'size-5'} />
              Intern
            </>
          ) : (
            <>
              <VenetianMask className={'size-5'} />
              Extern
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
    accessorKey: 'courseLevelPreference',
    header: 'Vorlesungspräferenz',
    cell: ({ row }) => {
      return (
        <div className={'flex gap-1 items-center'}>
          {row.original.courseLevelPreference === 'bachelor' ? (
            <>
              <BookOpen className={'size-5'} />
              Bachelor
            </>
          ) : row.original.courseLevelPreference === 'master' ? (
            <>
              <GraduationCap className={'size-5'} />
              Master
            </>
          ) : (
            <>
              <Blend className={'size-5'} />
              Beides
            </>
          )}
        </div>
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
    id: 'assignments',
    header: 'Vorlesungen',
    accessorKey: 'assignments',
    cell: ({ row }) => {
      const assignments = row.original.assignments

      if (!assignments || assignments.length === 0) {
        return null
      }

      const displayAssignments = assignments.slice(0, 3)
      const remainingCount = assignments.length - 3

      return (
        <AvatarGroup className="grayscale">
          {displayAssignments.map((assignment, index) => (
            <Avatar key={index}>
              <AvatarFallback>
                {initialsFromName(assignment.course.name)}
              </AvatarFallback>
            </Avatar>
          ))}
          {remainingCount > 0 && (
            <AvatarGroupCount>+{remainingCount}</AvatarGroupCount>
          )}
        </AvatarGroup>
      )
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
