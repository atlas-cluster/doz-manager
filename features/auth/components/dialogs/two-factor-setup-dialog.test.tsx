import { afterEach, describe, expect, it, vi } from 'vitest'

import { TwoFactorSetupDialog } from '@/features/auth/components/dialogs/two-factor-setup-dialog'
import { cleanup, render, screen } from '@testing-library/react'

vi.mock('qrcode', () => ({
  default: {
    toDataURL: vi.fn().mockResolvedValue('data:image/png;base64,FAKE'),
  },
}))

// Mock next/image to render a plain img tag
vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />
  },
}))

describe('TwoFactorSetupDialog', () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    totpUri: 'otpauth://totp/test?secret=ABC123',
    backupCodes: ['PRVD-AB12-CD34', 'PRVD-EF56-GH78'],
    onVerify: vi.fn().mockResolvedValue(true),
    onDone: vi.fn(),
    isVerifying: false,
  }

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('should render the setup step title', () => {
    render(<TwoFactorSetupDialog {...defaultProps} />)
    expect(screen.getByText('Authenticator einrichten')).toBeInTheDocument()
  })

  it('should render the setup description', () => {
    render(<TwoFactorSetupDialog {...defaultProps} />)
    expect(screen.getByText(/QR-Code/)).toBeInTheDocument()
  })

  it('should display the TOTP URI in an input', () => {
    render(<TwoFactorSetupDialog {...defaultProps} />)
    expect(
      screen.getByDisplayValue('otpauth://totp/test?secret=ABC123')
    ).toBeInTheDocument()
  })

  it('should render the "2FA aktivieren" button', () => {
    render(<TwoFactorSetupDialog {...defaultProps} />)
    expect(
      screen.getByRole('button', { name: '2FA aktivieren' })
    ).toBeInTheDocument()
  })

  it('should have "2FA aktivieren" button disabled when code is not 6 digits', () => {
    render(<TwoFactorSetupDialog {...defaultProps} />)
    expect(
      screen.getByRole('button', { name: '2FA aktivieren' })
    ).toBeDisabled()
  })

  it('should not render when open is false', () => {
    render(<TwoFactorSetupDialog {...defaultProps} open={false} />)
    expect(
      screen.queryByText('Authenticator einrichten')
    ).not.toBeInTheDocument()
  })

  it('should render manual URI text', () => {
    render(<TwoFactorSetupDialog {...defaultProps} />)
    expect(screen.getByText(/URI manuell eingeben/)).toBeInTheDocument()
  })

  it('should render confirmation code label', () => {
    render(<TwoFactorSetupDialog {...defaultProps} />)
    expect(screen.getByText(/Authenticator-App ein/)).toBeInTheDocument()
  })
})
