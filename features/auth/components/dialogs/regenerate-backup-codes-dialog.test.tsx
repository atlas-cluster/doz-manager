import { afterEach, describe, expect, it, vi } from 'vitest'

import { RegenerateBackupCodesDialog } from '@/features/auth/components/dialogs/regenerate-backup-codes-dialog'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'

vi.mock('@/features/auth/lib/client', () => ({
  authClient: {
    twoFactor: {
      generateBackupCodes: vi.fn(),
    },
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

describe('RegenerateBackupCodesDialog', () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    onDone: vi.fn(),
  }

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('should render the password step title', () => {
    render(<RegenerateBackupCodesDialog {...defaultProps} />)
    expect(screen.getByText('Backup-Codes neu erstellen')).toBeInTheDocument()
  })

  it('should render the password step description', () => {
    render(<RegenerateBackupCodesDialog {...defaultProps} />)
    expect(screen.getByText(/Passwort/)).toBeInTheDocument()
  })

  it('should render a password input', () => {
    render(<RegenerateBackupCodesDialog {...defaultProps} />)
    const input = document.getElementById('password')!
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('type', 'password')
  })

  it('should render Abbrechen and Neu erstellen buttons', () => {
    render(<RegenerateBackupCodesDialog {...defaultProps} />)
    expect(
      screen.getByRole('button', { name: 'Abbrechen' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Neu erstellen' })
    ).toBeInTheDocument()
  })

  it('should show toast error when submitting with empty password', async () => {
    const { toast } = await import('sonner')
    render(<RegenerateBackupCodesDialog {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: 'Neu erstellen' }))
    expect(toast.error).toHaveBeenCalled()
  })

  it('should call onOpenChange(false) when clicking Abbrechen', () => {
    render(<RegenerateBackupCodesDialog {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: 'Abbrechen' }))
    expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false)
  })

  it('should not render when open is false', () => {
    render(<RegenerateBackupCodesDialog {...defaultProps} open={false} />)
    expect(
      screen.queryByText('Backup-Codes neu erstellen')
    ).not.toBeInTheDocument()
  })

  it('should toggle password visibility with eye icon', () => {
    render(<RegenerateBackupCodesDialog {...defaultProps} />)
    const input = document.getElementById('password')!
    expect(input).toHaveAttribute('type', 'password')

    // Find the eye toggle button (icon-only ghost button)
    const toggleBtn = screen
      .getAllByRole('button')
      .find(
        (btn) =>
          btn.getAttribute('type') === 'button' &&
          btn.querySelector('svg') &&
          !btn.textContent?.trim()
      )
    expect(toggleBtn).toBeDefined()
    fireEvent.click(toggleBtn!)
    expect(input).toHaveAttribute('type', 'text')
  })
})
