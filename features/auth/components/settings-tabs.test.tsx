import { afterEach, describe, expect, it, vi } from 'vitest'

import type {
  AuthSettingsData,
  ProviderUserCounts,
} from '@/features/auth/types'
import { SettingsTabs } from '@/features/auth/components/settings-tabs'
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const mockSaveAuthSettings = vi.fn().mockResolvedValue(undefined)
const mockRouterRefresh = vi.fn()

vi.mock('@/features/auth/actions/save-auth-settings', () => ({
  saveAuthSettings: (...args: unknown[]) => mockSaveAuthSettings(...args),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: mockRouterRefresh,
  }),
}))

vi.mock('next/image', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    const alt = typeof props.alt === 'string' ? props.alt : ''
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={alt} />
  },
}))

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

const defaultSettings: AuthSettingsData = {
  passwordEnabled: true,
  passkeyEnabled: false,
  microsoftEnabled: false,
  microsoftClientId: '',
  microsoftTenantId: '',
  microsoftHasSecret: false,
  githubEnabled: false,
  githubClientId: '',
  githubHasSecret: false,
  oauthEnabled: false,
  oauthClientId: '',
  oauthIssuerUrl: '',
  oauthHasSecret: false,
}

const defaultCounts: ProviderUserCounts = {
  password: 10,
  passkey: 2,
  microsoft: 5,
  github: 3,
  oauth: 1,
}

function renderTabs(
  overrides: Partial<AuthSettingsData> = {},
  counts: Partial<ProviderUserCounts> = {}
) {
  return render(
    <SettingsTabs
      initialSettings={{ ...defaultSettings, ...overrides }}
      userCounts={{ ...defaultCounts, ...counts }}
    />
  )
}

describe('SettingsTabs', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  // --- Tab rendering ---
  it('should render all four tab triggers', () => {
    renderTabs()

    expect(screen.getByText('Passwort')).toBeInTheDocument()
    expect(screen.getByText('Microsoft')).toBeInTheDocument()
    expect(screen.getByText('GitHub')).toBeInTheDocument()
    expect(screen.getByText('OAuth')).toBeInTheDocument()
  })

  it('should render the password tab content by default', () => {
    renderTabs()

    expect(screen.getByText('Passwort Login erlauben')).toBeInTheDocument()
    expect(screen.getByText('Passkey Login erlauben')).toBeInTheDocument()
  })

  it('should render user count badges', () => {
    renderTabs()

    // Password tab is visible by default, showing password & passkey counts
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  // --- Tab switching ---
  it('should show Microsoft tab content when clicked', async () => {
    renderTabs()
    const user = userEvent.setup()

    await user.click(screen.getByText('Microsoft'))

    expect(screen.getByText('Microsoft Login erlauben')).toBeInTheDocument()
  })

  it('should show GitHub tab content when clicked', async () => {
    renderTabs()
    const user = userEvent.setup()

    await user.click(screen.getByText('GitHub'))

    expect(screen.getByText('GitHub Login erlauben')).toBeInTheDocument()
  })

  it('should show OAuth tab content when clicked', async () => {
    renderTabs()
    const user = userEvent.setup()

    await user.click(screen.getByText('OAuth'))

    expect(
      screen.getByText('Generischen OAuth Login erlauben')
    ).toBeInTheDocument()
  })

  // --- Switch toggles ---
  it('should toggle password switch', async () => {
    renderTabs({ passwordEnabled: true, passkeyEnabled: true })
    const user = userEvent.setup()

    // There are two switches on the password tab (password + passkey)
    const switches = screen.getAllByRole('switch')
    // First switch is password login
    await user.click(switches[0])

    // After clicking, password should be off - save button should be enabled
    const saveBtn = screen.getByRole('button', { name: /Speichern/ })
    expect(saveBtn).not.toBeDisabled()
  })

  it('should prevent disabling the last enabled auth method', async () => {
    const { toast } = await import('sonner')
    // Only password is enabled
    renderTabs({
      passwordEnabled: true,
      passkeyEnabled: false,
      microsoftEnabled: false,
      githubEnabled: false,
      oauthEnabled: false,
    })
    const user = userEvent.setup()

    const switches = screen.getAllByRole('switch')
    // Try to disable the only enabled method
    await user.click(switches[0])

    expect(toast.error).toHaveBeenCalledWith(
      'Mindestens eine Anmeldemethode muss aktiviert bleiben.'
    )
  })

  // --- Save password settings ---
  it('should save password tab settings', async () => {
    renderTabs({ passwordEnabled: true, passkeyEnabled: false })
    const user = userEvent.setup()

    // Toggle passkey on to create a change
    const switches = screen.getAllByRole('switch')
    await user.click(switches[1]) // passkey switch

    const saveBtn = screen.getByRole('button', { name: /Speichern/ })
    await user.click(saveBtn)

    await waitFor(() => {
      expect(mockSaveAuthSettings).toHaveBeenCalledWith(
        expect.objectContaining({
          passwordEnabled: true,
          passkeyEnabled: true,
        })
      )
    })
  })

  // --- Microsoft tab form fields ---
  it('should render Microsoft form fields when tab is active', async () => {
    renderTabs({ microsoftEnabled: true })
    const user = userEvent.setup()

    await user.click(screen.getByText('Microsoft'))

    expect(screen.getByLabelText(/Client ID/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Client Secret/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Tenant ID/)).toBeInTheDocument()
  })

  it('should show "(gespeichert)" when microsoft has stored secret', async () => {
    renderTabs({ microsoftEnabled: true, microsoftHasSecret: true })
    const user = userEvent.setup()

    await user.click(screen.getByText('Microsoft'))

    expect(screen.getByText('(gespeichert)')).toBeInTheDocument()
  })

  // --- GitHub tab form fields ---
  it('should render GitHub form fields when tab is active', async () => {
    renderTabs({ githubEnabled: true })
    const user = userEvent.setup()

    await user.click(screen.getByText('GitHub'))

    expect(screen.getByLabelText(/Client ID/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Client Secret/)).toBeInTheDocument()
  })

  // --- OAuth tab form fields ---
  it('should render OAuth form fields when tab is active', async () => {
    renderTabs({ oauthEnabled: true })
    const user = userEvent.setup()

    await user.click(screen.getByText('OAuth'))

    expect(screen.getByLabelText(/Issuer URL/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Client ID/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Client Secret/)).toBeInTheDocument()
  })

  // --- Save button disabled when no changes ---
  it('should disable save button when no changes on password tab', () => {
    renderTabs()

    const saveBtn = screen.getByRole('button', { name: /Speichern/ })
    expect(saveBtn).toBeDisabled()
  })

  // --- Microsoft Logo ---
  it('should render the Microsoft logo in tab trigger', () => {
    renderTabs()

    expect(screen.getByAltText('Microsoft Logo')).toBeInTheDocument()
  })

  // --- Toggle secret visibility ---
  it('should toggle microsoft client secret visibility', async () => {
    renderTabs({ microsoftEnabled: true })
    const user = userEvent.setup()

    await user.click(screen.getByText('Microsoft'))

    const secretInput = screen.getByLabelText(/Client Secret/)
    expect(secretInput).toHaveAttribute('type', 'password')

    // Click the eye toggle button (the one inside the secret field)
    const toggleButtons = screen
      .getAllByRole('button')
      .filter((btn) => !btn.textContent?.includes('Speichern'))
    // Find the toggle button near the secret field
    const eyeToggle = toggleButtons[0]
    await user.click(eyeToggle)

    expect(secretInput).toHaveAttribute('type', 'text')
  })

  // --- Error handling on save ---
  it('should show error toast when save fails', async () => {
    const { toast } = await import('sonner')
    mockSaveAuthSettings.mockRejectedValueOnce(new Error('Server-Fehler'))

    renderTabs({ passwordEnabled: true, passkeyEnabled: false })
    const user = userEvent.setup()

    // Toggle passkey to create a change
    const switches = screen.getAllByRole('switch')
    await user.click(switches[1])

    const saveBtn = screen.getByRole('button', { name: /Speichern/ })
    await user.click(saveBtn)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Server-Fehler')
    })
  })

  it('should show success toast after successful password save', async () => {
    const { toast } = await import('sonner')

    renderTabs({ passwordEnabled: true, passkeyEnabled: false })
    const user = userEvent.setup()

    const switches = screen.getAllByRole('switch')
    await user.click(switches[1])

    const saveBtn = screen.getByRole('button', { name: /Speichern/ })
    await user.click(saveBtn)

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        'Passwort-Einstellungen gespeichert'
      )
    })
  })
})
