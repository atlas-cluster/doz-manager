'use client'

import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Crown,
  Fingerprint,
  GithubIcon,
  KeyIcon,
  KeyRound,
  LogIn,
  MoreHorizontalIcon,
  PencilIcon,
  ShieldCheck,
  ShieldMinus,
  ShieldOff,
  ShieldPlus,
  TrashIcon,
  UserRound,
  XCircle,
} from 'lucide-react'
import Image from 'next/image'
import React, { useState } from 'react'

import { ChangePasswordDialog } from '@/features/access-control/components/dialog/change-password'
import { UserDialog } from '@/features/access-control/components/dialog/user'
import {
  AccessControlTableMeta,
  AccessControlUser,
} from '@/features/access-control/types'
import type { PublicAuthSettings } from '@/features/auth/types'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/features/shared/components/ui/avatar'
import { Badge } from '@/features/shared/components/ui/badge'
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

type AuthBadge = {
  key: string
  label: string
  icon: React.ReactNode
}

function getAuthBadges(
  user: AccessControlUser,
  enabledMethods?: PublicAuthSettings
): AuthBadge[] {
  const providers = new Set(
    (user.authProviders ?? []).map((provider) => provider.toLowerCase())
  )

  const badges: AuthBadge[] = []
  const knownProviders = new Set([
    'credential',
    'passkey',
    'microsoft',
    'github',
    'oauth',
  ])

  if (
    providers.has('credential') &&
    (enabledMethods?.passwordEnabled ?? true)
  ) {
    badges.push({
      key: 'credential',
      label: 'Passwort',
      icon: <KeyRound className="size-4!" />,
    })
  }

  if (providers.has('passkey') && (enabledMethods?.passkeyEnabled ?? true)) {
    badges.push({
      key: 'passkey',
      label: 'Passkey',
      icon: <KeyIcon className="size-4!" />,
    })
  }

  if (providers.has('microsoft') && enabledMethods?.microsoftEnabled) {
    badges.push({
      key: 'microsoft',
      label: 'Microsoft',
      icon: (
        <Image
          src="/microsoft.svg"
          alt="Microsoft Logo"
          width={16}
          height={16}
          className="size-4!"
        />
      ),
    })
  }

  if (providers.has('github') && enabledMethods?.githubEnabled) {
    badges.push({
      key: 'github',
      label: 'GitHub',
      icon: <GithubIcon className="size-4!" />,
    })
  }

  if (
    (providers.has('oauth') || providers.has('custom-oauth')) &&
    enabledMethods?.oauthEnabled
  ) {
    badges.push({
      key: 'oauth',
      label: 'OAuth',
      icon: <LogIn className="size-4!" />,
    })
  }

  if (user.twoFactorEnabled) {
    badges.push({
      key: '2fa',
      label: '2FA',
      icon: <ShieldCheck className="size-4!" />,
    })
  }

  providers.forEach((provider) => {
    if (knownProviders.has(provider)) return
    badges.push({
      key: provider,
      label: provider.toUpperCase(),
      icon: <KeyIcon className="size-4!" />,
    })
  })

  return badges
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
  const [addPasswordOpen, setAddPasswordOpen] = useState(false)
  const isSelf = user.id === meta?.currentUserId

  const hasPassword = (user.authProviders ?? [])
    .map((p) => p.toLowerCase())
    .includes('credential')

  const hasPasskey = (user.authProviders ?? [])
    .map((p) => p.toLowerCase())
    .includes('passkey')

  const enabledMethods = meta?.enabledMethods
  const passwordMethodEnabled = enabledMethods?.passwordEnabled ?? true
  const passkeyMethodEnabled = enabledMethods?.passkeyEnabled ?? true

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
      <ChangePasswordDialog
        userName={user.name}
        open={addPasswordOpen}
        onOpenChange={setAddPasswordOpen}
        title="Passwort hinzufügen"
        description={`Passwort für ${user.name} festlegen, um die Anmeldung per E-Mail und Passwort zu ermöglichen.`}
        onSubmit={(newPassword) => meta?.addPassword?.(user.id, newPassword)}
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
              {passwordMethodEnabled && (
                <>
                  {hasPassword ? (
                    <DropdownMenuItem onSelect={() => setPasswordOpen(true)}>
                      <KeyIcon />
                      Passwort ändern
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onSelect={() => setAddPasswordOpen(true)}>
                      <KeyRound />
                      Passwort hinzufügen
                    </DropdownMenuItem>
                  )}
                  {hasPassword && (
                    <DropdownMenuItem
                      onSelect={() => meta?.removePassword?.(user.id)}>
                      <XCircle />
                      Passwort entfernen
                    </DropdownMenuItem>
                  )}
                </>
              )}
              {passkeyMethodEnabled && hasPasskey && (
                <DropdownMenuItem
                  onSelect={() => meta?.removePasskeys?.(user.id)}>
                  <Fingerprint />
                  Passkeys entfernen
                </DropdownMenuItem>
              )}
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
              {passwordMethodEnabled && user.twoFactorEnabled && (
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
    accessorKey: 'authProviders',
    id: 'authProviders',
    header: 'Anmeldung',
    cell: ({ row, table }) => {
      const meta = table.options.meta as AccessControlTableMeta | undefined
      const badges = getAuthBadges(row.original, meta?.enabledMethods)

      if (!badges.length) {
        return <span className="text-muted-foreground">—</span>
      }

      return (
        <div className="flex flex-wrap gap-1.5">
          {badges.map((badge) => {
            return (
              <Badge key={badge.key} variant="secondary" className="gap-1">
                {badge.icon}
                {badge.label}
              </Badge>
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
    id: 'actions',
    cell: ({ row, table }) => <ActionsCell row={row} table={table} />,
    enableSorting: false,
    enableHiding: false,
    enableGlobalFilter: false,
  },
]
