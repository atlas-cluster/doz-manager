import { afterEach, describe, expect, it, vi } from 'vitest'

import { BackupCodesStep } from '@/features/auth/components/dialogs/backup-codes-step'
import { Dialog, DialogContent } from '@/features/shared/components/ui/dialog'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'

// Mock navigator.clipboard
const writeTextMock = vi.fn().mockResolvedValue(undefined)
Object.assign(navigator, {
  clipboard: { writeText: writeTextMock },
})

function renderStep(backupCodes: string[], onDone = vi.fn()) {
  return render(
    <Dialog open>
      <DialogContent>
        <BackupCodesStep backupCodes={backupCodes} onDone={onDone} />
      </DialogContent>
    </Dialog>
  )
}

describe('BackupCodesStep', () => {
  const backupCodes = [
    'PRVD-AB12-CD34',
    'PRVD-EF56-GH78',
    'PRVD-IJ90-KL12',
    'PRVD-MN34-OP56',
  ]
  const onDone = vi.fn()

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('should render the title', () => {
    renderStep(backupCodes, onDone)
    expect(screen.getByText('Backup-Codes speichern')).toBeInTheDocument()
  })

  it('should render all backup codes', () => {
    renderStep(backupCodes, onDone)
    for (const code of backupCodes) {
      expect(screen.getByText(code)).toBeInTheDocument()
    }
  })

  it('should render the copy button', () => {
    renderStep(backupCodes, onDone)
    expect(
      screen.getByRole('button', { name: /Alle Codes kopieren/ })
    ).toBeInTheDocument()
  })

  it('should copy codes to clipboard when clicking copy button', async () => {
    renderStep(backupCodes, onDone)
    fireEvent.click(screen.getByRole('button', { name: /Alle Codes kopieren/ }))
    expect(writeTextMock).toHaveBeenCalledWith(backupCodes.join('\n'))
  })

  it('should show "Kopiert!" after copying', async () => {
    renderStep(backupCodes, onDone)
    fireEvent.click(screen.getByRole('button', { name: /Alle Codes kopieren/ }))
    expect(await screen.findByText(/Kopiert/)).toBeInTheDocument()
  })

  it('should have Fertig button disabled until checkbox is checked', () => {
    renderStep(backupCodes, onDone)
    const fertigBtn = screen.getByRole('button', { name: 'Fertig' })
    expect(fertigBtn).toBeDisabled()
  })

  it('should enable Fertig button after checking confirmation checkbox', () => {
    renderStep(backupCodes, onDone)
    const checkbox = screen.getByRole('checkbox')
    fireEvent.click(checkbox)
    const fertigBtn = screen.getByRole('button', { name: 'Fertig' })
    expect(fertigBtn).not.toBeDisabled()
  })

  it('should call onDone when clicking Fertig after confirming', () => {
    renderStep(backupCodes, onDone)
    fireEvent.click(screen.getByRole('checkbox'))
    fireEvent.click(screen.getByRole('button', { name: 'Fertig' }))
    expect(onDone).toHaveBeenCalled()
  })

  it('should render the description', () => {
    renderStep(backupCodes, onDone)
    expect(screen.getByText(/Jeder Code kann nur einmal/)).toBeInTheDocument()
  })
})
