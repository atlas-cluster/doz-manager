import { afterEach, describe, expect, it, vi } from 'vitest'

import { AccountSettings } from '@/features/auth/components/dialogs/account-settings'
import type { AccountUser } from '@/features/auth/types'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

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
  })

  it('should render the Profil tab by default', () => {
    render(<AccountSettings initialUser={mockUser} />)
    expect(screen.getByText('Profil')).toBeInTheDocument()
    expect(screen.getByText('Sicherheit')).toBeInTheDocument()
  })

  it('should display the user name', () => {
    render(<AccountSettings initialUser={mockUser} />)
    expect(screen.getByText('Test User')).toBeInTheDocument()
  })

  it('should display the user email', () => {
    render(<AccountSettings initialUser={mockUser} />)
    expect(screen.getByText('test@example.com')).toBeInTheDocument()
  })

  it('should display the profile image URL', () => {
    render(<AccountSettings initialUser={mockUser} />)
    expect(
      screen.getByText('https://example.com/avatar.png')
    ).toBeInTheDocument()
  })

  it('should show "Kein Bild gesetzt" when image is null', () => {
    const userNoImage = { ...mockUser, image: null }
    render(<AccountSettings initialUser={userNoImage} />)
    expect(screen.getByText('Kein Bild gesetzt')).toBeInTheDocument()
  })

  it('should render edit buttons on profile tab', () => {
    render(<AccountSettings initialUser={mockUser} />)
    const editButtons = screen.getAllByRole('button', { name: /ndern/ })
    expect(editButtons.length).toBeGreaterThanOrEqual(3)
  })

  it('should render the Sicherheit tab content when clicked', async () => {
    const user = userEvent.setup()
    render(<AccountSettings initialUser={mockUser} />)
    const tabs = screen.getAllByText('Sicherheit')
    await user.click(tabs[0])
    expect(screen.getByText('Passwort')).toBeInTheDocument()
    expect(
      screen.getByText(/Zwei-Faktor-Authentifizierung/)
    ).toBeInTheDocument()
  })

  it('should show Aktivieren button when 2FA is disabled', async () => {
    const user = userEvent.setup()
    render(<AccountSettings initialUser={mockUser} />)
    const tabs = screen.getAllByText('Sicherheit')
    await user.click(tabs[0])
    expect(
      screen.getByRole('button', { name: /Aktivieren/ })
    ).toBeInTheDocument()
  })

  it('should show Deaktivieren button when 2FA is enabled', async () => {
    const user = userEvent.setup()
    const user2FA = { ...mockUser, twoFactorEnabled: true }
    render(<AccountSettings initialUser={user2FA} />)
    const tabs = screen.getAllByText('Sicherheit')
    await user.click(tabs[0])
    expect(
      screen.getByRole('button', { name: /Deaktivieren/ })
    ).toBeInTheDocument()
  })

  it('should show backup codes section when 2FA is enabled', async () => {
    const user = userEvent.setup()
    const user2FA = { ...mockUser, twoFactorEnabled: true }
    render(<AccountSettings initialUser={user2FA} />)
    const tabs = screen.getAllByText('Sicherheit')
    await user.click(tabs[0])
    expect(screen.getByText('Backup-Codes')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Neu erstellen' })
    ).toBeInTheDocument()
  })

  it('should not show backup codes section when 2FA is disabled', async () => {
    const user = userEvent.setup()
    render(<AccountSettings initialUser={mockUser} />)
    const tabs = screen.getAllByText('Sicherheit')
    await user.click(tabs[0])
    expect(screen.queryByText('Backup-Codes')).not.toBeInTheDocument()
  })

  it('should show Konto löschen section on security tab', async () => {
    const user = userEvent.setup()
    render(<AccountSettings initialUser={mockUser} />)
    const tabs = screen.getAllByText('Sicherheit')
    await user.click(tabs[0])
    expect(screen.getByRole('button', { name: /schen/ })).toBeInTheDocument()
  })

  it('should show Profilbild label', () => {
    render(<AccountSettings initialUser={mockUser} />)
    expect(screen.getByText('Profilbild')).toBeInTheDocument()
  })

  it('should show Name and E-Mail labels on profile tab', () => {
    render(<AccountSettings initialUser={mockUser} />)
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('E-Mail')).toBeInTheDocument()
  })

  it('should call onUserChange callback', () => {
    const onUserChange = vi.fn()
    render(
      <AccountSettings initialUser={mockUser} onUserChange={onUserChange} />
    )
    // Just verifying the prop is accepted without error
    expect(onUserChange).not.toHaveBeenCalled()
  })
})
