import { afterEach, describe, expect, it, vi } from 'vitest'

import { columns } from '@/features/access-control/components/data-table/columns'
import type {
  AccessControlTableMeta,
  AccessControlUser,
} from '@/features/access-control/types'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => {
    const alt = typeof props.alt === 'string' ? props.alt : ''
    return <img {...props} alt={alt} />
  },
}))

function makeUser(
  overrides: Partial<AccessControlUser> = {}
): AccessControlUser {
  return {
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
    image: null,
    isAdmin: false,
    twoFactorEnabled: false,
    createdAt: new Date('2025-01-01'),
    lastLogin: new Date('2025-06-01'),
    backupCodeCount: 0,
    authProviders: ['credential'],
    ...overrides,
  }
}

function TestTable({ data }: { data: AccessControlUser[] }) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      currentUserId: 'current-user',
      createUser: vi.fn(),
      updateUser: vi.fn(),
      deleteUser: vi.fn(),
      deleteUsers: vi.fn(),
      toggleAdmin: vi.fn(),
      changePassword: vi.fn(),
      disable2FA: vi.fn(),
      refreshUsers: vi.fn(),
    } satisfies AccessControlTableMeta,
  })

  return (
    <table>
      <thead>
        {table.getHeaderGroups().map((hg) => (
          <tr key={hg.id}>
            {hg.headers.map((h) => (
              <th key={h.id}>
                {h.isPlaceholder
                  ? null
                  : flexRender(h.column.columnDef.header, h.getContext())}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

describe('Access Control columns', () => {
  afterEach(() => {
    cleanup()
  })

  it('should define the expected number of columns', () => {
    // select, name, email, isAdmin, authProviders, actions
    expect(columns.length).toBe(6)
  })

  it('should render Rolle before Anmeldung in the header order', () => {
    render(<TestTable data={[makeUser()]} />)

    const headers = screen.getAllByRole('columnheader')
    const roleIndex = headers.findIndex((header) =>
      header.textContent?.includes('Rolle')
    )
    const anmeldungIndex = headers.findIndex((header) =>
      header.textContent?.includes('Anmeldung')
    )

    expect(roleIndex).toBeGreaterThanOrEqual(0)
    expect(anmeldungIndex).toBeGreaterThanOrEqual(0)
    expect(roleIndex).toBeLessThan(anmeldungIndex)
  })

  it('should render the user name', () => {
    render(<TestTable data={[makeUser()]} />)
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })

  it('should render the user email', () => {
    render(<TestTable data={[makeUser()]} />)
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
  })

  it('should render Admin role for admin users', () => {
    render(<TestTable data={[makeUser({ isAdmin: true })]} />)
    expect(screen.getByText('Admin')).toBeInTheDocument()
  })

  it('should render Benutzer role for non-admin users', () => {
    render(<TestTable data={[makeUser({ isAdmin: false })]} />)
    expect(screen.getByText('Benutzer')).toBeInTheDocument()
  })

  it('should render credential auth provider as Passwort', () => {
    render(<TestTable data={[makeUser({ authProviders: ['credential'] })]} />)
    expect(screen.getByText('Passwort')).toBeInTheDocument()
  })

  it('should render 2FA as badge in Anmeldung when enabled', () => {
    render(
      <TestTable
        data={[makeUser({ authProviders: [], twoFactorEnabled: true })]}
      />
    )
    expect(screen.getByText('2FA')).toBeInTheDocument()
  })

  it('should render passkey and microsoft badges when available', () => {
    render(
      <TestTable
        data={[makeUser({ authProviders: ['passkey', 'microsoft'] })]}
      />
    )
    expect(screen.getByText('Passkey')).toBeInTheDocument()
    expect(screen.getByText('Microsoft')).toBeInTheDocument()
  })

  it('should render unknown providers as uppercase badges', () => {
    render(<TestTable data={[makeUser({ authProviders: ['github'] })]} />)
    expect(screen.getByText('GITHUB')).toBeInTheDocument()
  })

  it('should render multiple users', () => {
    render(
      <TestTable
        data={[
          makeUser({ id: 'u1', name: 'Alice' }),
          makeUser({ id: 'u2', name: 'Bob' }),
        ]}
      />
    )
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })

  it('should render user initials in avatar', () => {
    render(<TestTable data={[makeUser({ name: 'John Doe' })]} />)
    expect(screen.getByText('JD')).toBeInTheDocument()
  })

  it('should render the Name sort button', () => {
    render(<TestTable data={[makeUser()]} />)
    expect(screen.getByRole('button', { name: /Name/ })).toBeInTheDocument()
  })

  it('should render the actions menu trigger', () => {
    render(<TestTable data={[makeUser()]} />)
    expect(screen.getByRole('button', { name: /Menü/ })).toBeInTheDocument()
  })

  it('should not render a separator for own user with basic actions only', async () => {
    const user = userEvent.setup()
    render(<TestTable data={[makeUser({ id: 'current-user' })]} />)
    await user.click(screen.getByRole('button', { name: /Menü/ }))

    expect(screen.getByText('Bearbeiten')).toBeInTheDocument()
    expect(screen.getByText('Passwort ändern')).toBeInTheDocument()
    expect(screen.queryByRole('separator')).not.toBeInTheDocument()
  })
})
