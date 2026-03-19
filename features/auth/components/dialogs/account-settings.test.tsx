import { afterEach, describe, expect, it, vi } from 'vitest'

import { AccountSettings } from '@/features/auth/components/dialogs/account-settings'
import type { AccountUser } from '@/features/auth/types'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const mockInvalidateUsersCache = vi.fn().mockResolvedValue(undefined)
const mockAddPasskey = vi.fn()
mockAddPasskey.mockResolvedValue({ data: {}, error: null })
const mockDeletePasskey = vi.fn()
mockDeletePasskey.mockResolvedValue({ data: { status: true }, error: null })
const mockRefetchPasskeys = vi.fn().mockResolvedValue(undefined)
let mockPasskeys: Array<{ id: string; name?: string; createdAt?: string }> = []

vi.mock('@/features/access-control/actions/invalidate-users-cache', () => ({
  invalidateUsersCache: () => mockInvalidateUsersCache(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}))

vi.mock('@/features/auth/actions/update-profile', () => ({
  updateProfile: vi.fn().mockResolvedValue({
    user: {
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      image: null,
      twoFactorEnabled: false,
    },
  }),
}))

vi.mock('@/features/auth/actions/delete-account', () => ({
  deleteAccount: vi.fn().mockResolvedValue({ success: true }),
}))

vi.mock('@/features/auth/actions/get-backup-code-count', () => ({
  getBackupCodeCount: vi.fn().mockResolvedValue(5),
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
    twoFactor: {
      enable: vi.fn().mockResolvedValue({ data: null, error: null }),
      verifyTotp: vi.fn().mockResolvedValue({ error: null }),
      disable: vi.fn().mockResolvedValue({ error: null }),
      generateBackupCodes: vi
        .fn()
        .mockResolvedValue({ data: { backupCodes: [] }, error: null }),
    },
    changePassword: vi.fn().mockResolvedValue({ error: null }),
  },
}))

vi.mock('@/features/auth/lib/backup-code-format', () => ({
  formatBackupCodes: (codes: string[]) => codes,
}))

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    promise: vi.fn(),
  },
}))

describe('AccountSettings', () => {
  const mockUser: AccountUser = {
    id: 'user-1',
    name: 'Test User',
    email: 'test@example.com',
    image: 'https://example.com/avatar.png',
    twoFactorEnabled: false,
  }

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
    mockPasskeys = []
    mockAddPasskey.mockResolvedValue({ data: {}, error: null })
    mockDeletePasskey.mockResolvedValue({ data: { status: true }, error: null })
    mockRefetchPasskeys.mockReset().mockResolvedValue(undefined)
  })

  it('should render the Profil tab by default', () => {
    render(<AccountSettings hasPassword={true} initialUser={mockUser} />)
    expect(screen.getByText('Profil')).toBeInTheDocument()
    expect(screen.getByText('Sicherheit')).toBeInTheDocument()
  })

  it('should display the user name', () => {
    render(<AccountSettings hasPassword={true} initialUser={mockUser} />)
    expect(screen.getByText('Test User')).toBeInTheDocument()
  })

  it('should display the user email', () => {
    render(<AccountSettings hasPassword={true} initialUser={mockUser} />)
    expect(screen.getByText('test@example.com')).toBeInTheDocument()
  })

  it('should display the profile image URL', () => {
    render(<AccountSettings hasPassword={true} initialUser={mockUser} />)
    expect(
      screen.getByText('https://example.com/avatar.png')
    ).toBeInTheDocument()
  })

  it('should show "Kein Bild gesetzt" when image is null', () => {
    const userNoImage = { ...mockUser, image: null }
    render(<AccountSettings hasPassword={true} initialUser={userNoImage} />)
    expect(screen.getByText('Kein Bild gesetzt')).toBeInTheDocument()
  })

  it('should render edit buttons on profile tab', () => {
    render(<AccountSettings hasPassword={true} initialUser={mockUser} />)
    const editButtons = screen.getAllByRole('button', { name: /ndern/ })
    expect(editButtons.length).toBeGreaterThanOrEqual(3)
  })

  it('should render the Sicherheit tab content when clicked', async () => {
    const user = userEvent.setup()
    render(<AccountSettings hasPassword={true} initialUser={mockUser} />)
    const tabs = screen.getAllByText('Sicherheit')
    await user.click(tabs[0])
    expect(screen.getByText('Passwort')).toBeInTheDocument()
    expect(
      screen.getByText(/Zwei-Faktor-Authentifizierung/)
    ).toBeInTheDocument()
  })

  it('should show Aktivieren button when 2FA is disabled', async () => {
    const user = userEvent.setup()
    render(<AccountSettings hasPassword={true} initialUser={mockUser} />)
    const tabs = screen.getAllByText('Sicherheit')
    await user.click(tabs[0])
    expect(
      screen.getByRole('button', { name: /Aktivieren/ })
    ).toBeInTheDocument()
  })

  it('should render passkey section on security tab', async () => {
    const user = userEvent.setup()
    render(<AccountSettings hasPassword={true} initialUser={mockUser} />)
    const tabs = screen.getAllByText('Sicherheit')
    await user.click(tabs[0])
    expect(screen.getByText('Passkeys')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Hinzuf/i })).toBeInTheDocument()
  })

  it('should add first passkey directly without opening management dialog', async () => {
    Object.defineProperty(window, 'PublicKeyCredential', {
      value: class PublicKeyCredential {},
      configurable: true,
    })

    const user = userEvent.setup()
    render(<AccountSettings hasPassword={true} initialUser={mockUser} />)

    // Set the implementation after mount so the mount refetch doesn't affect it
    mockRefetchPasskeys.mockImplementation(async () => {
      mockPasskeys = [{ id: 'passkey-1' }]
    })
    mockRefetchPasskeys.mockClear()
    mockInvalidateUsersCache.mockClear()

    const tabs = screen.getAllByText('Sicherheit')
    await user.click(tabs[0])

    await user.click(screen.getByRole('button', { name: /Hinzuf/i }))

    expect(mockAddPasskey).toHaveBeenCalledTimes(1)
    expect(mockRefetchPasskeys).toHaveBeenCalledTimes(1)
    expect(mockInvalidateUsersCache).toHaveBeenCalledTimes(1)
    expect(screen.queryByText('Passkeys verwalten')).not.toBeInTheDocument()
  })

  it('should render existing passkeys in the management dialog', async () => {
    mockPasskeys = [
      {
        id: 'passkey-1',
        name: 'MacBook Pro',
        createdAt: '2026-03-18T10:00:00.000Z',
      },
      {
        id: 'passkey-2',
        name: 'iPhone',
        createdAt: '2026-03-17T10:00:00.000Z',
      },
    ]

    const user = userEvent.setup()
    render(<AccountSettings hasPassword={true} initialUser={mockUser} />)
    const tabs = screen.getAllByText('Sicherheit')
    await user.click(tabs[0])
    await user.click(screen.getByRole('button', { name: 'Verwalten' }))

    expect(screen.getByText('MacBook Pro')).toBeInTheDocument()
    expect(screen.getByText('iPhone')).toBeInTheDocument()
    expect(screen.getByText('Passkeys verwalten')).toBeInTheDocument()
    const dialog = screen.getByRole('dialog', { name: 'Passkeys verwalten' })
    expect(
      within(dialog).getByRole('button', { name: /Hinzuf/i })
    ).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Widerrufen' })).toHaveLength(
      2
    )
  })

  it('should render empty state in management dialog when no passkeys exist', async () => {
    mockPasskeys = [{ id: 'passkey-seed' }]

    const user = userEvent.setup()
    render(<AccountSettings hasPassword={true} initialUser={mockUser} />)
    const tabs = screen.getAllByText('Sicherheit')
    await user.click(tabs[0])

    mockPasskeys = []

    await user.click(screen.getByRole('button', { name: 'Verwalten' }))

    expect(screen.getByText('Passkeys verwalten')).toBeInTheDocument()
    expect(
      screen.getByText('Noch keine Passkeys vorhanden')
    ).toBeInTheDocument()
  })

  it('should add a passkey from the management dialog', async () => {
    mockPasskeys = [{ id: 'passkey-existing' }]

    Object.defineProperty(window, 'PublicKeyCredential', {
      value: class PublicKeyCredential {},
      configurable: true,
    })

    const user = userEvent.setup()
    render(<AccountSettings hasPassword={true} initialUser={mockUser} />)

    // Set the implementation after mount so the mount refetch doesn't affect it
    mockRefetchPasskeys.mockImplementation(async () => {
      mockPasskeys = [{ id: 'passkey-1' }]
    })
    mockRefetchPasskeys.mockClear()

    const tabs = screen.getAllByText('Sicherheit')
    await user.click(tabs[0])
    await user.click(screen.getByRole('button', { name: 'Verwalten' }))

    const dialog = screen.getByRole('dialog', { name: 'Passkeys verwalten' })
    await user.click(within(dialog).getByRole('button', { name: /Hinzuf/i }))

    expect(mockAddPasskey).toHaveBeenCalledTimes(1)
    expect(mockRefetchPasskeys).toHaveBeenCalledTimes(1)
    expect(screen.getByText('1 Passkey hinterlegt')).toBeInTheDocument()
  })

  it('should revoke a selected passkey from the subdialog', async () => {
    mockPasskeys = [
      {
        id: 'passkey-1',
        name: 'MacBook Pro',
        createdAt: '2026-03-18T10:00:00.000Z',
      },
    ]

    const user = userEvent.setup()
    render(<AccountSettings hasPassword={true} initialUser={mockUser} />)

    // Set the implementation after mount so the mount refetch doesn't clear passkeys
    mockRefetchPasskeys.mockImplementation(async () => {
      mockPasskeys = []
    })
    mockRefetchPasskeys.mockClear()

    const tabs = screen.getAllByText('Sicherheit')
    await user.click(tabs[0])
    await user.click(screen.getByRole('button', { name: 'Verwalten' }))

    await user.click(screen.getByRole('button', { name: 'Widerrufen' }))
    expect(screen.getByText('Passkey widerrufen')).toBeInTheDocument()

    const dialogs = screen.getAllByRole('dialog')
    const activeDialog = dialogs[dialogs.length - 1]
    await user.click(
      within(activeDialog).getByRole('button', { name: 'Widerrufen' })
    )

    expect(mockDeletePasskey).toHaveBeenCalledWith({ id: 'passkey-1' })
    expect(mockRefetchPasskeys).toHaveBeenCalledTimes(1)
  })

  it('should show Deaktivieren button when 2FA is enabled', async () => {
    const user = userEvent.setup()
    const user2FA = { ...mockUser, twoFactorEnabled: true }
    render(<AccountSettings hasPassword={true} initialUser={user2FA} />)
    const tabs = screen.getAllByText('Sicherheit')
    await user.click(tabs[0])
    expect(
      screen.getByRole('button', { name: /Deaktivieren/ })
    ).toBeInTheDocument()
  })

  it('should show backup codes section when 2FA is enabled', async () => {
    const user = userEvent.setup()
    const user2FA = { ...mockUser, twoFactorEnabled: true }
    render(<AccountSettings hasPassword={true} initialUser={user2FA} />)
    const tabs = screen.getAllByText('Sicherheit')
    await user.click(tabs[0])
    expect(screen.getByText('Backup-Codes')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Neu erstellen' })
    ).toBeInTheDocument()
  })

  it('should not show backup codes section when 2FA is disabled', async () => {
    const user = userEvent.setup()
    render(<AccountSettings hasPassword={true} initialUser={mockUser} />)
    const tabs = screen.getAllByText('Sicherheit')
    await user.click(tabs[0])
    expect(screen.queryByText('Backup-Codes')).not.toBeInTheDocument()
  })

  it('should show Konto löschen section on security tab', async () => {
    const user = userEvent.setup()
    render(<AccountSettings hasPassword={true} initialUser={mockUser} />)
    const tabs = screen.getAllByText('Sicherheit')
    await user.click(tabs[0])
    expect(screen.getByRole('button', { name: /schen/ })).toBeInTheDocument()
  })

  it('should show Profilbild label', () => {
    render(<AccountSettings hasPassword={true} initialUser={mockUser} />)
    expect(screen.getByText('Profilbild')).toBeInTheDocument()
  })

  it('should show Name and E-Mail labels on profile tab', () => {
    render(<AccountSettings hasPassword={true} initialUser={mockUser} />)
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('E-Mail')).toBeInTheDocument()
  })

  it('should call onUserChange callback', () => {
    const onUserChange = vi.fn()
    render(
      <AccountSettings
        hasPassword={true}
        initialUser={mockUser}
        onUserChange={onUserChange}
      />
    )
    // Just verifying the prop is accepted without error
    expect(onUserChange).not.toHaveBeenCalled()
  })

  it('should prefill email dialog with current email each time it opens', async () => {
    const user = userEvent.setup()
    render(<AccountSettings hasPassword={true} initialUser={mockUser} />)

    const editButtons = screen.getAllByRole('button', { name: /ndern/ })
    await user.click(editButtons[2])
    const emailInput = screen.getByPlaceholderText('mail@example.com')
    expect(emailInput).toHaveValue('test@example.com')

    await user.type(emailInput, 'draft')
    expect(emailInput).toHaveValue('test@example.comdraft')
    await user.click(screen.getByRole('button', { name: 'Abbrechen' }))

    await user.click(editButtons[2])
    expect(screen.getByPlaceholderText('mail@example.com')).toHaveValue(
      'test@example.com'
    )
  })

  it('should hide password section when passwordEnabled is false', async () => {
    const user = userEvent.setup()
    render(
      <AccountSettings
        hasPassword={true}
        initialUser={mockUser}
        authSettings={{
          passwordEnabled: false,
          passkeyEnabled: true,
          microsoftEnabled: false,
          githubEnabled: false,
          oauthEnabled: false,
        }}
      />
    )
    const tabs = screen.getAllByText('Sicherheit')
    await user.click(tabs[0])
    expect(screen.queryByText('Passwort')).not.toBeInTheDocument()
  })

  it('should hide 2FA section when passwordEnabled is false', async () => {
    const user = userEvent.setup()
    render(
      <AccountSettings
        hasPassword={true}
        initialUser={mockUser}
        authSettings={{
          passwordEnabled: false,
          passkeyEnabled: true,
          microsoftEnabled: false,
          githubEnabled: false,
          oauthEnabled: false,
        }}
      />
    )
    const tabs = screen.getAllByText('Sicherheit')
    await user.click(tabs[0])
    expect(
      screen.queryByText(/Zwei-Faktor-Authentifizierung/)
    ).not.toBeInTheDocument()
  })

  it('should hide passkey section when passkeyEnabled is false', async () => {
    const user = userEvent.setup()
    render(
      <AccountSettings
        hasPassword={true}
        initialUser={mockUser}
        authSettings={{
          passwordEnabled: true,
          passkeyEnabled: false,
          microsoftEnabled: false,
          githubEnabled: false,
          oauthEnabled: false,
        }}
      />
    )
    const tabs = screen.getAllByText('Sicherheit')
    await user.click(tabs[0])
    expect(screen.queryByText('Passkeys')).not.toBeInTheDocument()
  })

  it('should hide backup codes when passwordEnabled is false even if 2FA was enabled', async () => {
    const user = userEvent.setup()
    const user2FA = { ...mockUser, twoFactorEnabled: true }
    render(
      <AccountSettings
        hasPassword={true}
        initialUser={user2FA}
        authSettings={{
          passwordEnabled: false,
          passkeyEnabled: true,
          microsoftEnabled: false,
          githubEnabled: false,
          oauthEnabled: false,
        }}
      />
    )
    const tabs = screen.getAllByText('Sicherheit')
    await user.click(tabs[0])
    expect(screen.queryByText('Backup-Codes')).not.toBeInTheDocument()
  })

  it('should show all sections when authSettings is not provided (defaults)', async () => {
    const user = userEvent.setup()
    render(<AccountSettings hasPassword={true} initialUser={mockUser} />)
    const tabs = screen.getAllByText('Sicherheit')
    await user.click(tabs[0])
    expect(screen.getByText('Passwort')).toBeInTheDocument()
    expect(screen.getByText('Passkeys')).toBeInTheDocument()
  })
})
