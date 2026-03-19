import { describe, expect, it, vi } from 'vitest'

import { PasskeyRevokeDialog } from '@/features/auth/components/dialogs/passkey-revoke-dialog'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

describe('PasskeyRevokeDialog', () => {
  it('should render dialog content with passkey name', () => {
    render(
      <PasskeyRevokeDialog
        open
        onOpenChangeAction={vi.fn()}
        isLoading={false}
        passkeyName="MacBook Pro"
        onConfirmAction={vi.fn().mockResolvedValue(undefined)}
      />
    )

    expect(screen.getByText('Passkey widerrufen')).toBeInTheDocument()
    expect(screen.getByText(/MacBook Pro/)).toBeInTheDocument()
  })

  it('should call onOpenChangeAction(false) when clicking Abbrechen', async () => {
    const onOpenChangeAction = vi.fn()
    const user = userEvent.setup()

    render(
      <PasskeyRevokeDialog
        open
        onOpenChangeAction={onOpenChangeAction}
        isLoading={false}
        passkeyName="MacBook Pro"
        onConfirmAction={vi.fn().mockResolvedValue(undefined)}
      />
    )

    await user.click(screen.getByRole('button', { name: 'Abbrechen' }))
    expect(onOpenChangeAction).toHaveBeenCalledWith(false)
  })

  it('should call onConfirmAction when clicking Widerrufen', async () => {
    const onConfirmAction = vi.fn().mockResolvedValue(undefined)
    const user = userEvent.setup()

    render(
      <PasskeyRevokeDialog
        open
        onOpenChangeAction={vi.fn()}
        isLoading={false}
        passkeyName="MacBook Pro"
        onConfirmAction={onConfirmAction}
      />
    )

    await user.click(screen.getByRole('button', { name: 'Widerrufen' }))
    expect(onConfirmAction).toHaveBeenCalledTimes(1)
  })

  it('should disable action buttons while loading', () => {
    render(
      <PasskeyRevokeDialog
        open
        onOpenChangeAction={vi.fn()}
        isLoading
        passkeyName="MacBook Pro"
        onConfirmAction={vi.fn().mockResolvedValue(undefined)}
      />
    )

    expect(screen.getByRole('button', { name: 'Abbrechen' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Widerrufen' })).toBeDisabled()
  })
})
