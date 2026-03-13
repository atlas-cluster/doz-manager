import { afterEach, describe, expect, it, vi } from 'vitest'

import { ChangePasswordDialog } from '@/features/auth/components/dialogs/change-password-dialog'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'

const mockChangePassword = vi.fn()
vi.mock('@/features/auth/lib/client', () => ({
  authClient: {
    changePassword: (...args: unknown[]) => mockChangePassword(...args),
  },
}))

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    promise: vi.fn(),
  },
}))

describe('ChangePasswordDialog', () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
  }

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('should render the dialog title', () => {
    render(<ChangePasswordDialog {...defaultProps} />)
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
  })

  it('should render the description', () => {
    render(<ChangePasswordDialog {...defaultProps} />)
    expect(screen.getByText(/aktuelles Passwort/)).toBeInTheDocument()
  })

  it('should render three password fields', () => {
    render(<ChangePasswordDialog {...defaultProps} />)
    expect(screen.getByText('Aktuelles Passwort')).toBeInTheDocument()
    expect(screen.getByText('Neues Passwort')).toBeInTheDocument()
    expect(screen.getByText(/bestätigen|Passwort best/i)).toBeInTheDocument()
  })

  it('should render three password inputs', () => {
    render(<ChangePasswordDialog {...defaultProps} />)
    const inputs = screen.getAllByPlaceholderText(/.+/)
    // At least 3 inputs: current, new, confirm
    expect(inputs.length).toBeGreaterThanOrEqual(3)
  })

  it('should render Abbrechen and submit buttons', () => {
    render(<ChangePasswordDialog {...defaultProps} />)
    expect(
      screen.getByRole('button', { name: 'Abbrechen' })
    ).toBeInTheDocument()
    // Find submit button (contains "Passwort")
    const submitBtns = screen
      .getAllByRole('button')
      .filter(
        (btn) =>
          btn.textContent?.includes('Passwort') &&
          btn.textContent !== 'Abbrechen'
      )
    expect(submitBtns.length).toBeGreaterThanOrEqual(1)
  })

  it('should show toast error when submitting with empty fields', async () => {
    const { toast } = await import('sonner')
    render(<ChangePasswordDialog {...defaultProps} />)

    // Find the non-cancel submit button
    const submitBtns = screen
      .getAllByRole('button')
      .filter(
        (btn) =>
          btn.textContent?.includes('ndern') ||
          btn.textContent?.includes('Passwort')
      )
    const submitBtn = submitBtns.find((b) => b.textContent !== 'Abbrechen')
    fireEvent.click(submitBtn!)

    expect(toast.error).toHaveBeenCalled()
    expect(mockChangePassword).not.toHaveBeenCalled()
  })

  it('should call onOpenChange(false) when clicking Abbrechen', () => {
    render(<ChangePasswordDialog {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: 'Abbrechen' }))
    expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false)
  })

  it('should not render when open is false', () => {
    render(<ChangePasswordDialog {...defaultProps} open={false} />)
    expect(screen.queryByRole('heading', { level: 2 })).not.toBeInTheDocument()
  })
})
