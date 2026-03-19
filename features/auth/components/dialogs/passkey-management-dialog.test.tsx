import { afterEach, describe, expect, it, vi } from 'vitest'

import { PasskeyManagementDialog } from '@/features/auth/components/dialogs/passkey-management-dialog'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const mockInvalidateUsersCache = vi.fn().mockResolvedValue(undefined)
const mockAddPasskey = vi.fn()
const mockDeletePasskey = vi.fn()
const mockRefetchPasskeys = vi.fn().mockResolvedValue(undefined)
let mockPasskeys: Array<{ id: string; name?: string; createdAt?: string }> = []

vi.mock('@/features/access-control/actions/invalidate-users-cache', () => ({
  invalidateUsersCache: () => mockInvalidateUsersCache(),
}))

vi.mock('@/features/auth/lib/client', () => ({
  authClient: {
    useListPasskeys: () => ({
      data: mockPasskeys,
      isPending: false,
      refetch: mockRefetchPasskeys,
    }),
    passkey: {
      addPasskey: (...args: unknown[]) => mockAddPasskey(...args),
      deletePasskey: (...args: unknown[]) => mockDeletePasskey(...args),
    },
  },
}))

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

describe('PasskeyManagementDialog', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
    mockPasskeys = []
    mockAddPasskey.mockResolvedValue({ data: {}, error: null })
    mockDeletePasskey.mockResolvedValue({ data: { status: true }, error: null })
  })

  it('should render shadcn empty state when no passkeys exist', () => {
    render(<PasskeyManagementDialog open onOpenChangeAction={vi.fn()} />)

    expect(screen.getByText('Passkeys verwalten')).toBeInTheDocument()
    expect(
      screen.getByText('Noch keine Passkeys vorhanden')
    ).toBeInTheDocument()
  })

  it('should render passkey list when entries exist', () => {
    mockPasskeys = [
      {
        id: 'pk-1',
        name: 'MacBook Pro',
        createdAt: '2026-03-18T10:00:00.000Z',
      },
      { id: 'pk-2', name: 'iPhone', createdAt: '2026-03-17T10:00:00.000Z' },
    ]

    render(<PasskeyManagementDialog open onOpenChangeAction={vi.fn()} />)

    expect(screen.getByText('MacBook Pro')).toBeInTheDocument()
    expect(screen.getByText('iPhone')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Widerrufen' })).toHaveLength(
      2
    )
  })

  it('should add passkey and refetch when clicking hinzufügen', async () => {
    Object.defineProperty(window, 'PublicKeyCredential', {
      value: class PublicKeyCredential {},
      configurable: true,
    })

    const user = userEvent.setup()
    render(<PasskeyManagementDialog open onOpenChangeAction={vi.fn()} />)

    const dialog = screen.getByRole('dialog', { name: 'Passkeys verwalten' })
    await user.click(within(dialog).getByRole('button', { name: /Hinzuf/i }))

    expect(mockAddPasskey).toHaveBeenCalledTimes(1)
    expect(mockRefetchPasskeys).toHaveBeenCalledTimes(1)
    expect(mockInvalidateUsersCache).toHaveBeenCalledTimes(1)
  })

  it('should open subdialog and revoke selected passkey', async () => {
    mockPasskeys = [
      {
        id: 'pk-1',
        name: 'MacBook Pro',
        createdAt: '2026-03-18T10:00:00.000Z',
      },
    ]

    const user = userEvent.setup()
    render(<PasskeyManagementDialog open onOpenChangeAction={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: 'Widerrufen' }))
    expect(screen.getByText('Passkey widerrufen')).toBeInTheDocument()

    const dialogs = screen.getAllByRole('dialog')
    const revokeDialog = dialogs[dialogs.length - 1]
    await user.click(
      within(revokeDialog).getByRole('button', { name: 'Widerrufen' })
    )

    expect(mockDeletePasskey).toHaveBeenCalledWith({ id: 'pk-1' })
    expect(mockRefetchPasskeys).toHaveBeenCalledTimes(1)
    expect(mockInvalidateUsersCache).toHaveBeenCalledTimes(1)
  })
})
