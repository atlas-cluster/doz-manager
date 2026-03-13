import { afterEach, describe, expect, it, vi } from 'vitest'

import { TwoFactorDisableDialog } from '@/features/auth/components/dialogs/two-factor-disable-dialog'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn(), promise: vi.fn() },
}))

describe('TwoFactorDisableDialog', () => {
  const defaultProps = {
    open: true,
    onOpenChangeAction: vi.fn(),
    isLoading: false,
    onConfirmAction: vi.fn().mockResolvedValue(undefined),
  }

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('should render the title', () => {
    render(<TwoFactorDisableDialog {...defaultProps} />)
    expect(screen.getByText('2FA-Code bestaetigen')).toBeInTheDocument()
  })

  it('should render the description', () => {
    render(<TwoFactorDisableDialog {...defaultProps} />)
    expect(screen.getByText(/6-stelligen Code/)).toBeInTheDocument()
  })

  it('should render the Deaktivieren button', () => {
    render(<TwoFactorDisableDialog {...defaultProps} />)
    expect(
      screen.getByRole('button', { name: 'Deaktivieren' })
    ).toBeInTheDocument()
  })

  it('should render the Abbrechen button', () => {
    render(<TwoFactorDisableDialog {...defaultProps} />)
    expect(
      screen.getByRole('button', { name: 'Abbrechen' })
    ).toBeInTheDocument()
  })

  it('should call onOpenChangeAction(false) when clicking Abbrechen', () => {
    render(<TwoFactorDisableDialog {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: 'Abbrechen' }))
    expect(defaultProps.onOpenChangeAction).toHaveBeenCalledWith(false)
  })

  it('should disable buttons when isLoading is true', () => {
    render(<TwoFactorDisableDialog {...defaultProps} isLoading={true} />)
    expect(screen.getByRole('button', { name: 'Deaktivieren' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Abbrechen' })).toBeDisabled()
  })

  it('should not render when open is false', () => {
    render(<TwoFactorDisableDialog {...defaultProps} open={false} />)
    expect(screen.queryByText('2FA-Code bestaetigen')).not.toBeInTheDocument()
  })
})
