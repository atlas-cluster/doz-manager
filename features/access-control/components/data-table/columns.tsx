'use client'

import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Crown,
  KeyIcon,
  KeyRound,
  MoreHorizontalIcon,
  PencilIcon,
  ShieldCheck,
  ShieldMinus,
  ShieldOff,
  ShieldPlus,
  TrashIcon,
  UserRound,
} from 'lucide-react'
import Image from 'next/image'
import React, { useState } from 'react'

import { ChangePasswordDialog } from '@/features/access-control/components/dialog/change-password'
import { UserDialog } from '@/features/access-control/components/dialog/user'
import {
  AccessControlTableMeta,
  AccessControlUser,
} from '@/features/access-control/types'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/features/shared/components/ui/avatar'
import { Button } from '@/features/shared/components/ui/button'
import { Checkbox } from '@/features/shared/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/features/shared/components/ui/dropdown-menu'
import { ColumnDef, Row, Table } from '@tanstack/table-core'

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

function ActionsCell({
  row,
  table,
}: {
  row: Row<AccessControlUser>
  table: Table<AccessControlUser>
}) {
  const meta = table.options.meta as AccessControlTableMeta | undefined
  const user = row.original
  const [editOpen, setEditOpen] = useState(false)
  const [passwordOpen, setPasswordOpen] = useState(false)
  const isSelf = user.id === meta?.currentUserId

  const selectedRows = table.getFilteredSelectedRowModel().rows
  return (
    <div className="flex justify-end">
      <UserDialog
        user={user}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSubmit={(payload) => meta?.updateUser?.(user.id, payload)}
      />
      <ChangePasswordDialog
        userName={user.name}
        open={passwordOpen}
        onOpenChange={setPasswordOpen}
        onSubmit={(newPassword) => meta?.changePassword?.(user.id, newPassword)}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size={'icon'} suppressHydrationWarning>
            <span className={'sr-only'}>Menü öffnen</span>
            <MoreHorizontalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Aktionen</DropdownMenuLabel>
          {selectedRows.length <= 1 || !row.getIsSelected() ? (
            <>
              <DropdownMenuItem onSelect={() => setEditOpen(true)}>
                <PencilIcon />
                Bearbeiten
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setPasswordOpen(true)}>
                <KeyIcon />
                Passwort ändern
              </DropdownMenuItem>
              {!isSelf && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={() =>
                      meta?.toggleAdmin?.(user.id, !user.isAdmin)
                    }>
                    {user.isAdmin ? (
                      <>
                        <ShieldMinus />
                        Admin entziehen
                      </>
                    ) : (
                      <>
                        <ShieldPlus />
                        Zum Admin befördern
                      </>
                    )}
                  </DropdownMenuItem>
                </>
              )}
              {user.twoFactorEnabled && (
                <DropdownMenuItem onSelect={() => meta?.disable2FA?.(user.id)}>
                  <ShieldOff />
                  2FA deaktivieren
                </DropdownMenuItem>
              )}
              {!isSelf && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant={'destructive'}
                    onSelect={() => meta?.deleteUser?.(user.id)}>
                    <TrashIcon />
                    Löschen
                  </DropdownMenuItem>
                </>
              )}
            </>
          ) : (
            <>
              <DropdownMenuItem
                variant={'destructive'}
                onSelect={() =>
                  meta?.deleteUsers?.(
                    selectedRows
                      .map((r) => r.original.id)
                      .filter((id) => id !== meta?.currentUserId)
                  )
                }>
                <TrashIcon className="mr-2 h-4 w-4" />
                Löschen (
                {
                  selectedRows.filter(
                    (r) => r.original.id !== meta?.currentUserId
                  ).length
                }
                )
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export const columns: ColumnDef<AccessControlUser>[] = [
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
    cell: ({ row }) => {
      const user = row.original
      return (
        <div className="flex items-center gap-2">
          <Avatar key={user.image ?? user.id} className="size-7">
            {user.image && <AvatarImage src={user.image} alt={user.name} />}
            <AvatarFallback className="text-xs">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <span>{user.name}</span>
        </div>
      )
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
    accessorKey: 'authProviders',
    id: 'authProviders',
    header: 'Anmeldung',
    cell: ({ row }) => {
      const providers = row.original.authProviders ?? []
      if (!providers.length) {
        return <span className="text-muted-foreground">—</span>
      }

      const providerConfig: Record<
        string,
        { label: string; icon: React.ReactNode }
      > = {
        credential: {
          label: 'Passwort',
          icon: <KeyRound className="size-4" />,
        },
        microsoft: {
          label: 'EntraID',
          icon: (
            <Image
              src="/microsoft.svg"
              alt="Microsoft Logo"
              width={16}
              height={16}
              className="size-4"
            />
          ),
        },
      }

      return (
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {providers.map((p) => {
            const config = providerConfig[p]
            if (!config) return null
            return (
              <div key={p} className="flex items-center gap-1">
                {config.icon}
                {config.label}
              </div>
            )
          })}
        </div>
      )
    },
    enableSorting: false,
    enableHiding: true,
    enableGlobalFilter: false,
  },
  {
    accessorKey: 'isAdmin',
    id: 'isAdmin',
    header: 'Rolle',
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-1">
          {row.original.isAdmin ? (
            <>
              <Crown className="size-4" />
              Admin
            </>
          ) : (
            <>
              <UserRound className="size-4" />
              Benutzer
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
    accessorKey: 'twoFactorEnabled',
    id: 'twoFactorEnabled',
    header: '2FA',
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-1">
          {row.original.twoFactorEnabled ? (
            <>
              <ShieldCheck className="size-4 text-green-600" />
              Aktiviert
            </>
          ) : (
            <>
              <ShieldOff className="text-muted-foreground size-4" />
              Deaktiviert
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
    accessorKey: 'backupCodeCount',
    id: 'backupCodeCount',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Recovery Codes
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
    cell: ({ row }) => {
      const count = row.original.backupCodeCount
      if (!row.original.twoFactorEnabled) {
        return <span className="text-muted-foreground">—</span>
      }
      return (
        <div className="flex items-center gap-1">
          <KeyRound className="size-4" />
          <span>{count}</span>
        </div>
      )
    },
    enableSorting: true,
    enableHiding: true,
    enableGlobalFilter: false,
  },
  {
    accessorKey: 'lastLogin',
    id: 'lastLogin',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Letzter Login
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
    cell: ({ row }) => {
      const lastLogin = row.original.lastLogin
      if (!lastLogin) {
        return <span className="text-muted-foreground">Noch nie</span>
      }
      return new Date(lastLogin).toLocaleString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    },
    enableSorting: true,
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
