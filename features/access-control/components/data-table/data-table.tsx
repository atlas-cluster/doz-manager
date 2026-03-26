'use client'

import { Plus, RefreshCwIcon, ShieldCheck, User, XIcon } from 'lucide-react'
import { useEffect, useRef, useState, useTransition } from 'react'
import * as React from 'react'
import { toast } from 'sonner'
import { z } from 'zod'

import { addAuthMethod } from '@/features/access-control/actions/add-auth-method'
import { changeUserPassword } from '@/features/access-control/actions/change-user-password'
import { createUser } from '@/features/access-control/actions/create-user'
import { deleteUser } from '@/features/access-control/actions/delete-user'
import { deleteUsers } from '@/features/access-control/actions/delete-users'
import { disableUser2FA } from '@/features/access-control/actions/disable-user-2fa'
import { getUsers } from '@/features/access-control/actions/get-users'
import { removeAuthMethod } from '@/features/access-control/actions/remove-auth-method'
import { removePasskeys } from '@/features/access-control/actions/remove-passkeys'
import { toggleAdmin } from '@/features/access-control/actions/toggle-admin'
import { updateUser } from '@/features/access-control/actions/update-user'
import { columns } from '@/features/access-control/components/data-table/columns'
import { UserDialog } from '@/features/access-control/components/dialog/user'
import { userSchema } from '@/features/access-control/schemas/user'
import {
  AccessControlUser,
  GetUsersResponse,
} from '@/features/access-control/types'
import type { PublicAuthSettings } from '@/features/auth/types'
import { DataTableFacetedFilter } from '@/features/shared/components/data-table-faceted-filter'
import { DataTablePagination } from '@/features/shared/components/data-table-pagination'
import { DataTableViewOptions } from '@/features/shared/components/data-table-view-options'
import { Button } from '@/features/shared/components/ui/button'
import { ButtonGroup } from '@/features/shared/components/ui/button-group'
import { Input } from '@/features/shared/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/features/shared/components/ui/table'
import { useDebounce } from '@/features/shared/hooks/use-debounce'
import { useLiveChanges } from '@/features/shared/hooks/use-live-changes'
import {
  USER_PROFILE_UPDATED_EVENT,
  type UserProfileUpdatedDetail,
} from '@/features/shared/lib/user-profile-sync'
import {
  ColumnFiltersState,
  OnChangeFn,
  PaginationState,
  RowSelectionState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'

export function DataTable({
  initialData,
  currentUserId,
  enabledMethods,
}: {
  initialData: GetUsersResponse
  currentUserId: string
  enabledMethods?: PublicAuthSettings
}) {
  const [isPending, startTransition] = useTransition()

  // Table state
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState<string>('')
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  // Debounce global filter
  const [inputValue, setInputValue] = useState<string>(globalFilter)
  const debouncedInputValue = useDebounce(inputValue)
  const skipNextDebouncedUpdate = useRef(false)

  useEffect(() => {
    if (skipNextDebouncedUpdate.current) {
      skipNextDebouncedUpdate.current = false
      return
    }
    if (debouncedInputValue !== globalFilter) {
      setGlobalFilter(debouncedInputValue)
      setPagination((prev) => ({ ...prev, pageIndex: 0 }))
    }
  }, [debouncedInputValue, globalFilter])

  // Table data
  const [data, setData] = useState<AccessControlUser[]>(initialData.data)
  const [pageCount, setPageCount] = useState<number>(initialData.pageCount)
  const [rowCount, setRowCount] = useState<number>(initialData.rowCount)
  const [facets, setFacets] = useState(initialData.facets)
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [hasExternalUpdateForEditing, setHasExternalUpdateForEditing] =
    useState(false)
  const editingUserIdRef = useRef<string | null>(null)

  useEffect(() => {
    const handler = (event: Event) => {
      const { detail } = event as CustomEvent<UserProfileUpdatedDetail>
      if (!detail) return
      setData((prev) =>
        prev.map((user) =>
          user.id === detail.id
            ? {
                ...user,
                name: detail.name,
                email: detail.email,
                image: detail.image,
                twoFactorEnabled: detail.twoFactorEnabled,
                backupCodeCount: detail.backupCodeCount ?? user.backupCodeCount,
                authProviders: (() => {
                  if (Array.isArray(detail.authProviders)) {
                    return detail.authProviders
                  }

                  if (typeof detail.hasPasskey !== 'boolean') {
                    return user.authProviders
                  }

                  const providers = user.authProviders.filter(
                    (provider) => provider.toLowerCase() !== 'passkey'
                  )
                  if (detail.hasPasskey) {
                    providers.push('passkey')
                  }
                  return providers
                })(),
              }
            : user
        )
      )
    }

    window.addEventListener(USER_PROFILE_UPDATED_EVENT, handler)
    return () => window.removeEventListener(USER_PROFILE_UPDATED_EVENT, handler)
  }, [])

  const fetchData = (
    currentPagination = pagination,
    currentSorting = sorting,
    currentFilters = columnFilters,
    currentGlobal = globalFilter
  ) => {
    return new Promise<void>((resolve) => {
      startTransition(async () => {
        try {
          const result = await getUsers({
            pageIndex: currentPagination.pageIndex,
            pageSize: currentPagination.pageSize,
            sorting: currentSorting as { id: string; desc: boolean }[],
            columnFilters: currentFilters as { id: string; value: unknown }[],
            globalFilter: currentGlobal,
          })
          setRowSelection({})
          setData(result.data)
          setPageCount(result.pageCount)
          setRowCount(result.rowCount)
          setFacets(result.facets)
        } finally {
          resolve()
        }
      })
    })
  }

  const isMounted = useRef(false)
  const skipNextFetch = useRef(false)

  useEffect(() => {
    if (isMounted.current) {
      if (skipNextFetch.current) {
        skipNextFetch.current = false
        return
      }
      fetchData()
    } else {
      isMounted.current = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination, sorting, columnFilters, globalFilter])

  useLiveChanges({
    tags: ['users'],
    onChangeAction: (event) => {
      const hasEditingConflict = Boolean(
        editingUserId &&
        event.entities?.some(
          (entity) =>
            entity.entityType === 'user' && entity.entityId === editingUserId
        )
      )

      if (hasEditingConflict) {
        setHasExternalUpdateForEditing(true)
        return
      }

      fetchData()
    },
  })

  const beginEditingUser = (id: string) => {
    if (editingUserIdRef.current === id) {
      return
    }
    editingUserIdRef.current = id
    setEditingUserId(id)
    setHasExternalUpdateForEditing(false)
  }

  const stopEditingUser = (id: string) => {
    if (editingUserIdRef.current !== id) {
      return
    }
    editingUserIdRef.current = null
    setEditingUserId(null)
    setHasExternalUpdateForEditing(false)
  }

  const reloadEditingUser = async () => {
    await fetchData()
    setHasExternalUpdateForEditing(false)
  }

  const dismissEditingConflict = () => {
    setHasExternalUpdateForEditing(false)
  }

  const handleCreate = (data: z.infer<typeof userSchema>) => {
    const promise = createUser(data).then(() => fetchData())

    toast.promise(promise, {
      loading: 'Benutzer wird erstellt...',
      success: 'Erfolgreich Benutzer erstellt',
      error: 'Fehler beim Erstellen des Benutzers',
    })
  }

  const handleUpdate = (id: string, data: z.infer<typeof userSchema>) => {
    const promise = updateUser(id, data).then(() => fetchData())

    toast.promise(promise, {
      loading: 'Benutzer wird aktualisiert...',
      success: 'Erfolgreich Benutzer aktualisiert',
      error: 'Fehler beim Aktualisieren des Benutzers',
    })
  }

  const handleDelete = (id: string) => {
    const promise = deleteUser(id).then(() => fetchData())

    toast.promise(promise, {
      loading: 'Benutzer wird gelöscht...',
      success: 'Erfolgreich Benutzer gelöscht',
      error: 'Fehler beim Löschen des Benutzers',
    })
  }

  const handleDeleteMany = (ids: string[]) => {
    const promise = deleteUsers(ids).then(() => fetchData())

    toast.promise(promise, {
      loading: 'Benutzer werden gelöscht...',
      success: 'Erfolgreich Benutzer gelöscht',
      error: 'Fehler beim Löschen der Benutzer',
    })
  }

  const handleToggleAdmin = (id: string, isAdmin: boolean) => {
    const promise = toggleAdmin(id, isAdmin).then(() => fetchData())

    toast.promise(promise, {
      loading: isAdmin
        ? 'Benutzer wird zum Admin befördert...'
        : 'Adminrechte werden entzogen...',
      success: isAdmin
        ? 'Erfolgreich zum Admin befördert'
        : 'Erfolgreich Adminrechte entzogen',
      error: isAdmin
        ? 'Fehler beim Befördern zum Admin'
        : 'Fehler beim Entziehen der Adminrechte',
    })
  }

  const handleChangePassword = (id: string, newPassword: string) => {
    const promise = changeUserPassword(id, newPassword).then(() => fetchData())

    toast.promise(promise, {
      loading: 'Passwort wird geändert...',
      success: 'Erfolgreich Passwort geändert',
      error: 'Fehler beim Ändern des Passworts',
    })
  }

  const handleDisable2FA = (id: string) => {
    const promise = disableUser2FA(id).then(() => fetchData())

    toast.promise(promise, {
      loading: '2FA wird deaktiviert...',
      success: 'Erfolgreich 2FA deaktiviert',
      error: 'Fehler beim Deaktivieren der 2FA',
    })
  }

  const handleAddPassword = (userId: string, password: string) => {
    const promise = addAuthMethod(userId, password).then(() => fetchData())

    toast.promise(promise, {
      loading: 'Passwort wird hinzugefügt...',
      success: 'Passwort erfolgreich hinzugefügt',
      error: (err) =>
        err instanceof Error
          ? err.message
          : 'Fehler beim Hinzufügen des Passworts',
    })
  }

  const handleRemovePassword = (userId: string) => {
    const promise = removeAuthMethod(userId, 'credential').then(() =>
      fetchData()
    )

    toast.promise(promise, {
      loading: 'Passwort wird entfernt...',
      success: 'Passwort erfolgreich entfernt',
      error: (err) =>
        err instanceof Error
          ? err.message
          : 'Fehler beim Entfernen des Passworts',
    })
  }

  const handleRemovePasskeys = (userId: string) => {
    const promise = removePasskeys(userId).then(() => fetchData())

    toast.promise(promise, {
      loading: 'Passkeys werden entfernt...',
      success: 'Passkeys erfolgreich entfernt',
      error: (err) =>
        err instanceof Error
          ? err.message
          : 'Fehler beim Entfernen der Passkeys',
    })
  }

  const handleRefresh = () => {
    fetchData()
  }

  const handleClearFilters = () => {
    const nextPagination = { ...pagination, pageIndex: 0 }

    skipNextFetch.current = true
    skipNextDebouncedUpdate.current = true
    setColumnFilters([])
    setGlobalFilter('')
    setInputValue('')
    setPagination(nextPagination)

    fetchData(nextPagination, sorting, [], '')
  }

  const onColumnFiltersChange: OnChangeFn<ColumnFiltersState> = (
    updaterOrValue
  ) => {
    setColumnFilters(updaterOrValue)
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }

  const onGlobalFilterChange: OnChangeFn<string> = (updaterOrValue) => {
    setGlobalFilter(updaterOrValue)
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }

  const table = useReactTable({
    data,
    columns,
    pageCount,
    rowCount,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,

    meta: {
      currentUserId,
      createUser: handleCreate,
      updateUser: handleUpdate,
      deleteUser: handleDelete,
      deleteUsers: handleDeleteMany,
      toggleAdmin: handleToggleAdmin,
      changePassword: handleChangePassword,
      disable2FA: handleDisable2FA,
      addPassword: handleAddPassword,
      removePassword: handleRemovePassword,
      removePasskeys: handleRemovePasskeys,
      refreshUsers: handleRefresh,
      enabledMethods,
      beginEditingUser,
      stopEditingUser,
      reloadEditingUser,
      dismissEditingConflict,
      editingUserId,
      hasExternalUpdateForEditing,
    },

    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: onColumnFiltersChange,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: onGlobalFilterChange,
    onPaginationChange: setPagination,

    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
    autoResetPageIndex: false,

    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
      pagination,
    },
  })

  const adminCounts = new Map<string, number>()
  if (facets.isAdmin) {
    Object.entries(facets.isAdmin).forEach(([key, value]) => {
      adminCounts.set(key, value)
    })
  }

  return (
    <div className="w-full space-y-3">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between">
        <div className="flex w-full flex-wrap items-center gap-2">
          <div className="flex w-full gap-2 md:w-64">
            {/** Desktop only: Show input only */}
            <Input
              className={'hidden md:flex'}
              placeholder="Benutzer suchen..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            {/** Mobile only: Show input, view options and refresh button */}
            <ButtonGroup className={'w-full flex-1 md:hidden'}>
              <Input
                placeholder="Benutzer suchen..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <DataTableViewOptions table={table} />
              <Button
                variant="outline"
                size="icon"
                type="button"
                disabled={isPending}
                suppressHydrationWarning
                onClick={handleRefresh}>
                <RefreshCwIcon className={isPending ? 'animate-spin' : ''} />
                <span className={'sr-only'}>Daten aktualisieren</span>
              </Button>
            </ButtonGroup>
            {/** Mobile only: Show small create button next to searchbar */}
            <div className={'flex md:hidden'}>
              <UserDialog
                trigger={
                  <Button suppressHydrationWarning size={'icon'}>
                    <Plus />
                    <span className={'sr-only'}>Benutzer erstellen</span>
                  </Button>
                }
                onSubmit={handleCreate}
              />
            </div>
          </div>
          <DataTableFacetedFilter
            title={'Rolle'}
            options={[
              {
                value: 'true',
                label: 'Admin',
                icon: ShieldCheck,
              },
              {
                value: 'false',
                label: 'Benutzer',
                icon: User,
              },
            ]}
            column={table.getColumn('isAdmin')}
            facets={adminCounts}
          />
          {(table.getState().columnFilters.length > 0 || globalFilter) && (
            <Button
              variant="ghost"
              size={'icon'}
              onClick={handleClearFilters}
              suppressHydrationWarning>
              <XIcon />
              <span className={'sr-only'}>Filter löschen</span>
            </Button>
          )}
        </div>
        {/** Desktop only: Show view options, refresh button and create button on the right */}
        <div className={'hidden gap-2 md:flex'}>
          <ButtonGroup>
            <DataTableViewOptions table={table} />
            <Button
              variant="outline"
              size="icon"
              type="button"
              disabled={isPending}
              suppressHydrationWarning
              onClick={handleRefresh}>
              <RefreshCwIcon className={isPending ? 'animate-spin' : ''} />
              <span className={'sr-only'}>Daten aktualisieren</span>
            </Button>
          </ButtonGroup>
          <UserDialog
            trigger={
              <Button suppressHydrationWarning>Benutzer erstellen</Button>
            }
            onSubmit={handleCreate}
          />
        </div>
      </div>
      <div className="mb-3 overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center">
                  Keine Benutzer gefunden.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  )
}
