import { afterEach, describe, expect, it, vi } from 'vitest'

import LoginForm from '@/features/auth/components/login-form'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'

const mockPush = vi.fn()
const mockRefresh = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
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
const mockVerifyTotp = vi.fn()
const mockVerifyBackupCode = vi.fn()
vi.mock('@/features/auth/lib/client', () => ({
  authClient: {
    signIn: { email: (...args: unknown[]) => mockSignInEmail(...args) },
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

describe('LoginForm', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('should render the login card', () => {
    render(<LoginForm />)
    expect(screen.getByText(/Willkommen/)).toBeInTheDocument()
  })

  it('should render email and password fields', () => {
    render(<LoginForm />)
    expect(document.getElementById('email')).toBeInTheDocument()
    expect(document.getElementById('password')).toBeInTheDocument()
  })

  it('should render the Anmelden button', () => {
    render(<LoginForm />)
    const buttons = screen.getAllByRole('button', { name: /Anmelden/ })
    expect(buttons.length).toBeGreaterThanOrEqual(1)
  })

  it('should render the Microsoft login button', () => {
    render(<LoginForm />)
    expect(
      screen.getByRole('button', { name: /Microsoft/ })
    ).toBeInTheDocument()
  })

  it('should render the credentials step subtitle', () => {
    render(<LoginForm />)
    expect(screen.getByText(/Melden Sie sich/)).toBeInTheDocument()
  })

  it('should show toast error when submitting empty fields', async () => {
    const { toast } = await import('sonner')
    render(<LoginForm />)
    const form = document.getElementById('email')!.closest('form')!
    fireEvent.submit(form)
    expect(toast.error).toHaveBeenCalled()
    expect(mockSignInEmail).not.toHaveBeenCalled()
  })

  it('should call signIn.email with entered credentials', async () => {
    mockSignInEmail.mockResolvedValue({ data: null, error: null })
    render(<LoginForm />)
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
    render(<LoginForm />)
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
    render(<LoginForm />)
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
    render(<LoginForm />)
    const pw = document.getElementById('password')!
    expect(pw).toHaveAttribute('type', 'password')
    const toggle = pw
      .closest('.relative')!
      .querySelector('button[type="button"]')!
    fireEvent.click(toggle)
    expect(pw).toHaveAttribute('type', 'text')
  })

  it('should render the backup code input', () => {
    render(<LoginForm />)
    expect(document.getElementById('backup-code')).toBeInTheDocument()
  })

  it('should render admin contact link', () => {
    render(<LoginForm />)
    expect(screen.getByText(/Administrator/)).toBeInTheDocument()
  })

  it('should render the theme toggle', () => {
    render(<LoginForm />)
    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument()
  })
})
