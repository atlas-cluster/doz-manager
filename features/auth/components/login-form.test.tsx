import { afterEach, describe, expect, it, vi } from 'vitest'

import LoginForm from '@/features/auth/components/login-form'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'

const createDeferred = <T,>() => {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((res) => {
    resolve = res
  })
  return { promise, resolve }
}

const mockPush = vi.fn()
const mockRefresh = vi.fn()
const mockReplace = vi.fn()
const mockSearchParams = new URLSearchParams()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
    replace: mockReplace,
  }),
  useSearchParams: () => mockSearchParams,
}))

vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => {
    const { fill, priority, ...rest } = props as Record<string, unknown>
    return (
      <img
        {...rest}
        data-fill={fill ? 'true' : undefined}
        data-priority={priority ? 'true' : undefined}
      />
    )
  },
}))

const mockSignInEmail = vi.fn()
const mockSignInPasskey = vi.fn()
const mockSignInSocial = vi.fn()
const mockVerifyTotp = vi.fn()
const mockVerifyBackupCode = vi.fn()
vi.mock('@/features/auth/lib/client', () => ({
  authClient: {
    signIn: {
      email: (...args: unknown[]) => mockSignInEmail(...args),
      passkey: (...args: unknown[]) => mockSignInPasskey(...args),
      social: (...args: unknown[]) => mockSignInSocial(...args),
    },
    twoFactor: {
      verifyTotp: (...args: unknown[]) => mockVerifyTotp(...args),
      verifyBackupCode: (...args: unknown[]) => mockVerifyBackupCode(...args),
    },
  },
}))

vi.mock('@/features/auth/lib/backup-code-format', () => ({
  toCanonicalBackupCode: (raw: string) => raw.toUpperCase(),
}))

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn(), promise: vi.fn() },
}))

vi.mock('@/features/app', () => ({
  ThemeToggle: () => <button data-testid="theme-toggle">Theme</button>,
}))

const allEnabled = {
  passwordEnabled: true,
  passkeyEnabled: true,
  microsoftEnabled: true,
  githubEnabled: false,
  oauthEnabled: false,
}

describe('LoginForm', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('should render the login card', () => {
    render(<LoginForm enabledMethods={allEnabled} />)
    expect(screen.getByText(/Willkommen/)).toBeInTheDocument()
  })

  it('should render email and password fields', () => {
    render(<LoginForm enabledMethods={allEnabled} />)
    expect(document.getElementById('email')).toBeInTheDocument()
    expect(document.getElementById('password')).toBeInTheDocument()
  })

  it('should render the Anmelden button', () => {
    render(<LoginForm enabledMethods={allEnabled} />)
    const buttons = screen.getAllByRole('button', { name: /Anmelden/ })
    expect(buttons.length).toBeGreaterThanOrEqual(1)
  })

  it('should render the Microsoft login button', () => {
    render(<LoginForm enabledMethods={allEnabled} />)
    expect(
      screen.getByRole('button', { name: /Microsoft/ })
    ).toBeInTheDocument()
  })

  it('should call passkey sign-in when clicking the passkey button', async () => {
    Object.defineProperty(window, 'PublicKeyCredential', {
      value: class PublicKeyCredential {},
      configurable: true,
    })
    mockSignInPasskey.mockResolvedValue({ error: null })
    render(<LoginForm enabledMethods={allEnabled} />)
    fireEvent.click(screen.getByRole('button', { name: /Passkey anmelden/i }))
    await vi.waitFor(() => {
      expect(mockSignInPasskey).toHaveBeenCalled()
      expect(mockPush).toHaveBeenCalledWith('/lecturers')
    })
  })

  it('should show only one spinner during passkey sign-in', async () => {
    Object.defineProperty(window, 'PublicKeyCredential', {
      value: class PublicKeyCredential {},
      configurable: true,
    })

    let resolvePasskeySignIn: ((value: unknown) => void) | null = null
    mockSignInPasskey.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePasskeySignIn = resolve
        })
    )

    render(<LoginForm enabledMethods={allEnabled} />)
    fireEvent.click(screen.getByRole('button', { name: /Passkey anmelden/i }))

    await vi.waitFor(() => {
      expect(screen.getAllByRole('status')).toHaveLength(1)
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(resolvePasskeySignIn as any)?.({ error: null })
  })

  it('should disable all credential controls while email sign-in is loading and show only email spinner', async () => {
    const deferred = createDeferred<{ data: null; error: null }>()
    mockSignInEmail.mockImplementation(() => deferred.promise)

    render(<LoginForm enabledMethods={allEnabled} />)
    fireEvent.change(document.getElementById('email')!, {
      target: { value: 'u@e.com' },
    })
    fireEvent.change(document.getElementById('password')!, {
      target: { value: 'pass123' },
    })
    fireEvent.submit(document.getElementById('email')!.closest('form')!)

    await vi.waitFor(() => {
      expect(screen.getAllByRole('status')).toHaveLength(1)
      expect(document.getElementById('email')).toBeDisabled()
      expect(document.getElementById('password')).toBeDisabled()
      expect(screen.getByRole('button', { name: /Microsoft/ })).toBeDisabled()
      expect(
        screen.getByRole('button', { name: /Passkey anmelden/i })
      ).toBeDisabled()
      expect(
        document
          .getElementById('email')!
          .closest('form')!
          .querySelector('button[type="submit"]')
      ).toBeDisabled()
    })

    deferred.resolve({ data: null, error: null })
  })

  it('should disable microsoft and email button while passkey sign-in is loading and keep single spinner', async () => {
    Object.defineProperty(window, 'PublicKeyCredential', {
      value: class PublicKeyCredential {},
      configurable: true,
    })
    const deferred = createDeferred<{ error: null }>()
    mockSignInPasskey.mockImplementation(() => deferred.promise)

    render(<LoginForm enabledMethods={allEnabled} />)
    fireEvent.click(screen.getByRole('button', { name: /Passkey anmelden/i }))

    await vi.waitFor(() => {
      expect(screen.getAllByRole('status')).toHaveLength(1)
      expect(screen.getByRole('button', { name: /Microsoft/ })).toBeDisabled()
      expect(
        document
          .getElementById('email')!
          .closest('form')!
          .querySelector('button[type="submit"]')
      ).toBeDisabled()
    })

    deferred.resolve({ error: null })
  })

  it('should show only backup spinner and disable backup controls while backup verification is loading', async () => {
    mockSignInEmail.mockResolvedValue({
      data: { twoFactorRedirect: true },
      error: null,
    })
    const deferred = createDeferred<{ error: null }>()
    mockVerifyBackupCode.mockImplementation(() => deferred.promise)

    render(<LoginForm enabledMethods={allEnabled} />)
    fireEvent.change(document.getElementById('email')!, {
      target: { value: 'u@e.com' },
    })
    fireEvent.change(document.getElementById('password')!, {
      target: { value: 'pass123' },
    })
    fireEvent.submit(document.getElementById('email')!.closest('form')!)

    await vi.waitFor(() => {
      expect(
        screen.getByRole('button', { name: /Backup-Code verwenden/i })
      ).toBeInTheDocument()
    })

    fireEvent.click(
      screen.getByRole('button', { name: /Backup-Code verwenden/i })
    )
    fireEvent.change(document.getElementById('backup-code')!, {
      target: { value: 'PRVD-AAAA-BBBB' },
    })
    fireEvent.submit(document.getElementById('backup-code')!.closest('form')!)

    await vi.waitFor(() => {
      expect(screen.getAllByRole('status')).toHaveLength(1)
      expect(
        screen.getByRole('button', { name: /Backup-Code bestätigen/i })
      ).toBeDisabled()
      expect(screen.getByRole('button', { name: /← Zurück/i })).toBeDisabled()
    })

    deferred.resolve({ error: null })
  })

  it('should render the credentials step subtitle', () => {
    render(<LoginForm enabledMethods={allEnabled} />)
    expect(screen.getByText(/Melden Sie sich/)).toBeInTheDocument()
  })

  it('should show toast error when submitting empty fields', async () => {
    const { toast } = await import('sonner')
    render(<LoginForm enabledMethods={allEnabled} />)
    const form = document.getElementById('email')!.closest('form')!
    fireEvent.submit(form)
    expect(toast.error).toHaveBeenCalled()
    expect(mockSignInEmail).not.toHaveBeenCalled()
  })

  it('should call signIn.email with entered credentials', async () => {
    mockSignInEmail.mockResolvedValue({ data: null, error: null })
    render(<LoginForm enabledMethods={allEnabled} />)
    fireEvent.change(document.getElementById('email')!, {
      target: { value: 'u@e.com' },
    })
    fireEvent.change(document.getElementById('password')!, {
      target: { value: 'pass123' },
    })
    fireEvent.submit(document.getElementById('email')!.closest('form')!)
    expect(mockSignInEmail).toHaveBeenCalledWith({
      email: 'u@e.com',
      password: 'pass123',
    })
  })

  it('should show error toast on sign-in failure', async () => {
    const { toast } = await import('sonner')
    mockSignInEmail.mockResolvedValue({
      data: null,
      error: { message: 'fail' },
    })
    render(<LoginForm enabledMethods={allEnabled} />)
    fireEvent.change(document.getElementById('email')!, {
      target: { value: 'u@e.com' },
    })
    fireEvent.change(document.getElementById('password')!, {
      target: { value: 'pass' },
    })
    fireEvent.submit(document.getElementById('email')!.closest('form')!)
    await vi.waitFor(() => {
      expect(toast.error).toHaveBeenCalled()
    })
  })

  it('should navigate on successful sign-in without 2FA', async () => {
    mockSignInEmail.mockResolvedValue({ data: {}, error: null })
    render(<LoginForm enabledMethods={allEnabled} />)
    fireEvent.change(document.getElementById('email')!, {
      target: { value: 'u@e.com' },
    })
    fireEvent.change(document.getElementById('password')!, {
      target: { value: 'pass' },
    })
    fireEvent.submit(document.getElementById('email')!.closest('form')!)
    await vi.waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/lecturers')
      expect(mockRefresh).toHaveBeenCalled()
    })
  })

  it('should toggle password visibility', () => {
    render(<LoginForm enabledMethods={allEnabled} />)
    const pw = document.getElementById('password')!
    expect(pw).toHaveAttribute('type', 'password')
    const toggle = pw
      .closest('.relative')!
      .querySelector('button[type="button"]')!
    fireEvent.click(toggle)
    expect(pw).toHaveAttribute('type', 'text')
  })

  it('should not render 2FA and backup inputs before the 2FA step', () => {
    render(<LoginForm enabledMethods={allEnabled} />)
    expect(document.getElementById('backup-code')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /Backup-Code verwenden/i })
    ).not.toBeInTheDocument()
  })

  it('should render 2FA controls only after twoFactorRedirect', async () => {
    mockSignInEmail.mockResolvedValue({
      data: { twoFactorRedirect: true },
      error: null,
    })
    render(<LoginForm enabledMethods={allEnabled} />)
    fireEvent.change(document.getElementById('email')!, {
      target: { value: 'u@e.com' },
    })
    fireEvent.change(document.getElementById('password')!, {
      target: { value: 'pass123' },
    })
    fireEvent.submit(document.getElementById('email')!.closest('form')!)

    await vi.waitFor(() => {
      expect(
        screen.getByRole('button', { name: /Backup-Code verwenden/i })
      ).toBeInTheDocument()
    })
  })

  it('should render admin contact link', () => {
    render(<LoginForm enabledMethods={allEnabled} />)
    expect(screen.getByText(/Administrator/)).toBeInTheDocument()
  })

  it('should render the theme toggle', () => {
    render(<LoginForm enabledMethods={allEnabled} />)
    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument()
  })
})
