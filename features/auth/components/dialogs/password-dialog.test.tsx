import { afterEach, describe, expect, it, vi } from 'vitest'

import { PasswordDialog } from '@/features/auth/components/dialogs/password-dialog'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn(), promise: vi.fn() },
}))

describe('PasswordDialog', () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    title: '2FA aktivieren',
    description: 'Passwort eingeben',
    confirmLabel: 'Weiter',
    isLoading: false,
    onConfirm: vi.fn().mockResolvedValue(undefined),
  }

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('should render the title', () => {
    render(<PasswordDialog {...defaultProps} />)
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
  })

  it('should render the description', () => {
    render(<PasswordDialog {...defaultProps} />)
    expect(screen.getByText('Passwort eingeben')).toBeInTheDocument()
  })

  it('should render the confirm button with the given label', () => {
    render(<PasswordDialog {...defaultProps} />)
    expect(screen.getByRole('button', { name: 'Weiter' })).toBeInTheDocument()
  })

  it('should render the cancel button', () => {
    render(<PasswordDialog {...defaultProps} />)
    expect(
      screen.getByRole('button', { name: 'Abbrechen' })
    ).toBeInTheDocument()
  })

  it('should render a password input', () => {
    render(<PasswordDialog {...defaultProps} />)
    const input = document.getElementById('password')!
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('type', 'password')
  })

  it('should show toast error when clicking confirm with empty password', async () => {
    const { toast } = await import('sonner')
    render(<PasswordDialog {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: 'Weiter' }))
    expect(toast.error).toHaveBeenCalled()
    expect(defaultProps.onConfirm).not.toHaveBeenCalled()
  })

  it('should call onConfirm with the entered password', async () => {
    render(<PasswordDialog {...defaultProps} />)
    const input = document.getElementById('password')!
    fireEvent.change(input, { target: { value: 'mypassword' } })
    fireEvent.click(screen.getByRole('button', { name: 'Weiter' }))
    expect(defaultProps.onConfirm).toHaveBeenCalledWith('mypassword')
  })

  it('should toggle password visibility with eye icon', () => {
    render(<PasswordDialog {...defaultProps} />)
    const input = document.getElementById('password')!
    expect(input).toHaveAttribute('type', 'password')

    // Find the toggle button (not the confirm or cancel buttons)
    const allButtons = screen.getAllByRole('button')
    const toggleButton = allButtons.find(
      (btn) =>
        btn.getAttribute('type') === 'button' &&
        btn.textContent === '' &&
        btn.querySelector('svg')
    )
    expect(toggleButton).toBeDefined()
    fireEvent.click(toggleButton!)
    expect(input).toHaveAttribute('type', 'text')
  })

  it('should call onOpenChange(false) when clicking Abbrechen', () => {
    render(<PasswordDialog {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: 'Abbrechen' }))
    expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false)
  })

  it('should disable buttons when isLoading is true', () => {
    render(<PasswordDialog {...defaultProps} isLoading={true} />)
    expect(screen.getByRole('button', { name: 'Weiter' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Abbrechen' })).toBeDisabled()
  })

  it('should not render when open is false', () => {
    render(<PasswordDialog {...defaultProps} open={false} />)
    expect(screen.queryByRole('heading', { level: 2 })).not.toBeInTheDocument()
  })

  it('should call onConfirm when pressing Enter in input', async () => {
    render(<PasswordDialog {...defaultProps} />)
    const input = document.getElementById('password')!
    fireEvent.change(input, { target: { value: 'mypassword' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(defaultProps.onConfirm).toHaveBeenCalledWith('mypassword')
  })
})
