import { afterEach, describe, expect, it, vi } from 'vitest'

import { DataTable } from '@/features/access-control/components/data-table/data-table'
import type { GetUsersResponse } from '@/features/access-control/types'
import { USER_PROFILE_UPDATED_EVENT } from '@/features/shared/lib/user-profile-sync'
import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'

vi.mock('@/features/access-control/actions/create-user', () => ({
  createUser: vi.fn().mockResolvedValue({}),
}))
vi.mock('@/features/access-control/actions/update-user', () => ({
  updateUser: vi.fn().mockResolvedValue({}),
}))
vi.mock('@/features/access-control/actions/delete-user', () => ({
  deleteUser: vi.fn().mockResolvedValue({}),
}))
vi.mock('@/features/access-control/actions/delete-users', () => ({
  deleteUsers: vi.fn().mockResolvedValue({}),
}))
vi.mock('@/features/access-control/actions/toggle-admin', () => ({
  toggleAdmin: vi.fn().mockResolvedValue({}),
}))
vi.mock('@/features/access-control/actions/change-user-password', () => ({
  changeUserPassword: vi.fn().mockResolvedValue({}),
}))
vi.mock('@/features/access-control/actions/disable-user-2fa', () => ({
  disableUser2FA: vi.fn().mockResolvedValue({}),
}))
vi.mock('@/features/access-control/actions/get-users', () => ({
  getUsers: vi.fn().mockResolvedValue({
    data: [],
    pageCount: 0,
    rowCount: 0,
    facets: { isAdmin: {} },
  }),
}))

vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => {
    const alt = typeof props.alt === 'string' ? props.alt : ''
    return <img {...props} alt={alt} />
  },
}))

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn(), promise: vi.fn() },
}))

const emptyData: GetUsersResponse = {
  data: [],
  pageCount: 0,
  rowCount: 0,
  facets: { isAdmin: {} },
}

const sampleData: GetUsersResponse = {
  data: [
    {
      id: 'u1',
      name: 'Alice Admin',
      email: 'alice@example.com',
      image: null,
      isAdmin: true,
      twoFactorEnabled: true,
      createdAt: new Date('2025-01-01'),
      lastLogin: new Date('2025-06-01'),
      backupCodeCount: 5,
      authProviders: ['credential'],
    },
    {
      id: 'u2',
      name: 'Bob User',
      email: 'bob@example.com',
      image: null,
      isAdmin: false,
      twoFactorEnabled: false,
      createdAt: new Date('2025-02-01'),
      lastLogin: null,
      backupCodeCount: 0,
      authProviders: ['credential'],
    },
  ],
  pageCount: 1,
  rowCount: 2,
  facets: { isAdmin: { true: 1, false: 1 } },
}

describe('Access Control DataTable', () => {
  afterEach(() => {
    cleanup()
  })

  it('should render the empty state', () => {
    render(<DataTable initialData={emptyData} currentUserId="admin-1" />)
    expect(screen.getByText('Keine Benutzer gefunden.')).toBeInTheDocument()
  })

  it('should render user rows when data is provided', () => {
    render(<DataTable initialData={sampleData} currentUserId="admin-1" />)
    expect(screen.getByText('Alice Admin')).toBeInTheDocument()
    expect(screen.getByText('Bob User')).toBeInTheDocument()
  })

  it('should render the search input', () => {
    render(<DataTable initialData={sampleData} currentUserId="admin-1" />)
    expect(
      screen.getAllByPlaceholderText('Benutzer suchen...').length
    ).toBeGreaterThanOrEqual(1)
  })

  it('should render the create user button', () => {
    render(<DataTable initialData={sampleData} currentUserId="admin-1" />)
    const createBtns = screen.getAllByRole('button', {
      name: /Benutzer erstellen/,
    })
    expect(createBtns.length).toBeGreaterThanOrEqual(1)
  })

  it('should render the refresh button', () => {
    render(<DataTable initialData={sampleData} currentUserId="admin-1" />)
    const refreshBtns = screen.getAllByRole('button', {
      name: /Daten aktualisieren/,
    })
    expect(refreshBtns.length).toBeGreaterThanOrEqual(1)
  })

  it('should render user emails', () => {
    render(<DataTable initialData={sampleData} currentUserId="admin-1" />)
    expect(screen.getByText('alice@example.com')).toBeInTheDocument()
    expect(screen.getByText('bob@example.com')).toBeInTheDocument()
  })

  it('should render role filter', () => {
    render(<DataTable initialData={sampleData} currentUserId="admin-1" />)
    expect(screen.getByRole('button', { name: /Rolle/ })).toBeInTheDocument()
  })

  it('should sync two factor badge from profile update events', async () => {
    render(<DataTable initialData={sampleData} currentUserId="admin-1" />)
    const aliceRow = screen.getByText('Alice Admin').closest('tr')
    expect(aliceRow).not.toBeNull()
    expect(
      within(aliceRow as HTMLTableRowElement).getByText('2FA')
    ).toBeInTheDocument()

    window.dispatchEvent(
      new CustomEvent(USER_PROFILE_UPDATED_EVENT, {
        detail: {
          id: 'u1',
          name: 'Alice Admin',
          email: 'alice@example.com',
          image: null,
          twoFactorEnabled: false,
          backupCodeCount: 2,
        },
      })
    )

    await waitFor(() => {
      expect(
        within(aliceRow as HTMLTableRowElement).queryByText('2FA')
      ).not.toBeInTheDocument()
    })
  })

  it('should sync passkey badge from profile update events', async () => {
    render(<DataTable initialData={sampleData} currentUserId="admin-1" />)
    const bobRow = screen.getByText('Bob User').closest('tr')
    expect(bobRow).not.toBeNull()
    expect(
      within(bobRow as HTMLTableRowElement).queryByText('Passkey')
    ).not.toBeInTheDocument()

    window.dispatchEvent(
      new CustomEvent(USER_PROFILE_UPDATED_EVENT, {
        detail: {
          id: 'u2',
          name: 'Bob User',
          email: 'bob@example.com',
          image: null,
          twoFactorEnabled: false,
          hasPasskey: true,
        },
      })
    )

    await waitFor(() => {
      expect(
        within(bobRow as HTMLTableRowElement).getByText('Passkey')
      ).toBeInTheDocument()
    })
  })
})
