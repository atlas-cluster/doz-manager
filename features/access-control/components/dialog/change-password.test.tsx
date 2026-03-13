import { afterEach, describe, expect, it, vi } from 'vitest'

import { ChangePasswordDialog } from '@/features/access-control/components/dialog/change-password'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

describe('ChangePasswordDialog', () => {
  const defaultProps = {
    userName: 'Max Mustermann',
    open: true,
    onOpenChange: vi.fn(),
    onSubmit: vi.fn(),
  }

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('should render the dialog title', () => {
    render(<ChangePasswordDialog {...defaultProps} />)

    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
  })

  it('should display the user name in the description', () => {
    render(<ChangePasswordDialog {...defaultProps} />)

    expect(screen.getByText(/Max Mustermann/)).toBeInTheDocument()
  })

  it('should render password and confirm password fields', () => {
    render(<ChangePasswordDialog {...defaultProps} />)

    expect(document.getElementById('new-password')).toBeInTheDocument()
    expect(document.getElementById('confirm-password')).toBeInTheDocument()
  })

  it('should render the submit button', () => {
    render(<ChangePasswordDialog {...defaultProps} />)

    expect(screen.getByRole('button', { name: /Passwort/ })).toBeInTheDocument()
  })

  it('should show validation error for short password', async () => {
    render(<ChangePasswordDialog {...defaultProps} />)

    const passwordInput = document.getElementById('new-password')!
    const confirmInput = document.getElementById('confirm-password')!

    fireEvent.change(passwordInput, { target: { value: 'short' } })
    fireEvent.change(confirmInput, { target: { value: 'short' } })
    fireEvent.submit(passwordInput.closest('form')!)

    expect(await screen.findByText(/mindestens 8 Zeichen/)).toBeInTheDocument()
    expect(defaultProps.onSubmit).not.toHaveBeenCalled()
  })

  it('should show error when passwords do not match', async () => {
    render(<ChangePasswordDialog {...defaultProps} />)

    const passwordInput = document.getElementById('new-password')!
    const confirmInput = document.getElementById('confirm-password')!

    fireEvent.change(passwordInput, { target: { value: 'securepassword1' } })
    fireEvent.change(confirmInput, { target: { value: 'securepassword2' } })
    fireEvent.submit(passwordInput.closest('form')!)

    expect(await screen.findByText(/stimmen nicht/)).toBeInTheDocument()
    expect(defaultProps.onSubmit).not.toHaveBeenCalled()
  })

  it('should call onSubmit with the password when valid', async () => {
    render(<ChangePasswordDialog {...defaultProps} />)

    const passwordInput = document.getElementById('new-password')!
    const confirmInput = document.getElementById('confirm-password')!

    fireEvent.change(passwordInput, { target: { value: 'validPassword123' } })
    fireEvent.change(confirmInput, { target: { value: 'validPassword123' } })
    fireEvent.submit(passwordInput.closest('form')!)

    expect(defaultProps.onSubmit).toHaveBeenCalledWith('validPassword123')
  })

  it('should call onOpenChange(false) after successful submit', async () => {
    render(<ChangePasswordDialog {...defaultProps} />)

    const passwordInput = document.getElementById('new-password')!
    const confirmInput = document.getElementById('confirm-password')!

    fireEvent.change(passwordInput, { target: { value: 'validPassword123' } })
    fireEvent.change(confirmInput, { target: { value: 'validPassword123' } })
    fireEvent.submit(passwordInput.closest('form')!)

    expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false)
  })

  it('should not render when open is false', () => {
    render(<ChangePasswordDialog {...defaultProps} open={false} />)

    expect(screen.queryByRole('heading', { level: 2 })).not.toBeInTheDocument()
  })
})
