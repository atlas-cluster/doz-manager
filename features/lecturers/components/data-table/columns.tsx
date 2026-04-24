'use client'

import {
  ArrowDown,
  ArrowLeftRight,
  ArrowUp,
  ArrowUpDown,
  BadgeCheck,
  Blend,
  BookOpen,
  Building2,
  GraduationCap,
  MoreHorizontalIcon,
  PencilIcon,
  Plus,
  TrashIcon,
  VenetianMask,
} from 'lucide-react'
import React, { useState } from 'react'

import { CourseAssignmentDialog } from '@/features/lecturers/components/dialog/course-assignment'
import { CourseQualificationDialog } from '@/features/lecturers/components/dialog/course-qualification'
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
  const [CourseQualificationDialogOpen, setCourseQualificationDialogOpen] =
    useState(false)
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
        onEditingChange={(editing) =>
          editing
            ? meta?.beginEditingLecturer?.(lecturer.id)
            : meta?.stopEditingLecturer?.(lecturer.id)
        }
        hasExternalUpdate={
          meta?.editingLecturerId === lecturer.id &&
          Boolean(meta?.hasExternalUpdateForEditing)
        }
        onReloadFromServer={() => meta?.reloadEditingLecturer?.()}
      />
      <CourseAssignmentDialog
        lecturer={lecturer}
        open={courseAssignmentDialogOpen}
        onOpenChange={setCourseAssignmentDialogOpen}
        onSubmit={() => meta?.refreshLecturers()}
        onEditingChange={(editing) =>
          editing
            ? meta?.beginEditingLecturer?.(lecturer.id)
            : meta?.stopEditingLecturer?.(lecturer.id)
        }
        hasExternalUpdate={
          meta?.editingLecturerId === lecturer.id &&
          Boolean(meta?.hasExternalUpdateForEditing)
        }
        onReloadFromServer={() => meta?.reloadEditingLecturer?.()}
      />
      <CourseQualificationDialog
        lecturer={lecturer}
        open={CourseQualificationDialogOpen}
        onOpenChange={setCourseQualificationDialogOpen}
        onEditingChange={(editing) =>
          editing
            ? meta?.beginEditingLecturer?.(lecturer.id)
            : meta?.stopEditingLecturer?.(lecturer.id)
        }
        hasExternalUpdate={
          meta?.editingLecturerId === lecturer.id &&
          Boolean(meta?.hasExternalUpdateForEditing)
        }
        onReloadFromServer={() => meta?.reloadEditingLecturer?.()}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size={'icon'} suppressHydrationWarning>
            <MoreHorizontalIcon />
            <span className={'sr-only'}>Menü öffnen</span>
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
                onSelect={() => setCourseQualificationDialogOpen(true)}>
                <BadgeCheck />
                Qualifikationen bearbeiten
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
                <TrashIcon />
                Löschen ({selectedRows.length})
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

function NameCell({
  row,
  table,
}: {
  row: Row<Lecturer>
  table: Table<Lecturer>
}) {
  const meta = table.options.meta as LecturerTableMeta | undefined
  const lecturer = row.original
  const [open, setOpen] = useState(false)

  const fullName = `${lecturer.title ? lecturer.title + ' ' : ''}${lecturer.firstName} ${lecturer.secondName ? lecturer.secondName + ' ' : ''}${lecturer.lastName}`

  return (
    <>
      <div className="cursor-pointer" onClick={() => setOpen(true)}>
        {fullName}
      </div>
      <LecturerDialog
        lecturer={lecturer}
        open={open}
        onOpenChange={setOpen}
        onSubmit={(payload) => meta?.updateLecturer?.(lecturer.id, payload)}
        onEditingChange={(editing) =>
          editing
            ? meta?.beginEditingLecturer?.(lecturer.id)
            : meta?.stopEditingLecturer?.(lecturer.id)
        }
        hasExternalUpdate={
          meta?.editingLecturerId === lecturer.id &&
          Boolean(meta?.hasExternalUpdateForEditing)
        }
        onReloadFromServer={() => meta?.reloadEditingLecturer?.()}
      />
    </>
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
            <ArrowUp />
          ) : column.getIsSorted() === 'desc' ? (
            <ArrowDown />
          ) : (
            <ArrowUpDown />
          )}
        </Button>
      )
    },
    sortingFn: (rowA, rowB) => {
      return rowA.original.lastName.localeCompare(rowB.original.lastName)
    },
    cell: ({ row, table }) => <NameCell row={row} table={table} />,
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
        <div className={'flex items-center gap-1'}>
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
        <div className={'flex items-center gap-1'}>
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
    cell: ({ row, table }) => {
      const assignments = row.original.assignments ?? []

      const displayAssignments = assignments.slice(0, 3)
      const remainingCount = assignments.length - 3
      const isEmpty = displayAssignments.length === 0

      return (
        <CourseAssignmentDialog
          lecturer={row.original}
          onSubmit={() =>
            (
              table.options.meta as LecturerTableMeta | undefined
            )?.refreshLecturers()
          }
          onEditingChange={(editing) => {
            const meta = table.options.meta as LecturerTableMeta | undefined
            if (editing) {
              meta?.beginEditingLecturer?.(row.original.id)
              return
            }
            meta?.stopEditingLecturer?.(row.original.id)
          }}
          hasExternalUpdate={(() => {
            const meta = table.options.meta as LecturerTableMeta | undefined
            return (
              meta?.editingLecturerId === row.original.id &&
              Boolean(meta?.hasExternalUpdateForEditing)
            )
          })()}
          onReloadFromServer={() =>
            (
              table.options.meta as LecturerTableMeta | undefined
            )?.reloadEditingLecturer?.()
          }
          readonly
          trigger={
            <AvatarGroup className="cursor-pointer grayscale">
              {isEmpty ? (
                <Avatar>
                  <AvatarFallback>
                    <Plus className="size-4" />
                  </AvatarFallback>
                </Avatar>
              ) : (
                <>
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
                </>
              )}
            </AvatarGroup>
          }
        />
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
