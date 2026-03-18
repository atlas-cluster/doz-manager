'use client'

import { EyeIcon, EyeOffIcon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { BackupCodesStep } from '@/features/auth/components/dialogs/backup-codes-step'
import { formatBackupCodes } from '@/features/auth/lib/backup-code-format'
import { authClient } from '@/features/auth/lib/client'
import { Button } from '@/features/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/features/shared/components/ui/dialog'
import { Input } from '@/features/shared/components/ui/input'

type RegenStep = 'password' | 'backup'

type RegenerateBackupCodesDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onDone: () => void
}

export function RegenerateBackupCodesDialog({
  open,
  onOpenChange,
  onDone,
}: RegenerateBackupCodesDialogProps) {
  const [step, setStep] = useState<RegenStep>('password')
  const [isLoading, setIsLoading] = useState(false)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [codes, setCodes] = useState<string[]>([])

  const handleConfirm = async () => {
    if (!password) {
      toast.error('Bitte geben Sie Ihr Passwort ein.')
      return
    }

    setIsLoading(true)
    try {
      const responsePromise = authClient.twoFactor.generateBackupCodes({
        password,
      })

      const toastPromise = responsePromise.then(({ data, error }) => {
        if (error) {
          throw new Error('Backup-Codes konnten nicht neu erstellt werden.')
        }
        return (data ?? null) as { backupCodes?: string[] } | null
      })

      toast.promise(toastPromise, {
        loading: 'Backup-Codes werden neu erstellt...',
        success: 'Backup-Codes wurden neu erstellt.',
        error: (error) =>
          error instanceof Error
            ? error.message
            : 'Backup-Codes konnten nicht neu erstellt werden.',
      })

      const payload = await toastPromise
      const nextCodes =
        (payload as unknown as { backupCodes?: string[] } | null)
          ?.backupCodes ?? []
      setCodes(formatBackupCodes(nextCodes))
      setStep('backup')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!isLoading) {
          if (!v) {
            setStep('password')
            setPassword('')
            setCodes([])
          }
          onOpenChange(v)
        }
      }}>
      <DialogContent forceMount className="sm:max-w-md">
        {step === 'password' && (
          <>
            <DialogHeader>
              <DialogTitle>Backup-Codes neu erstellen</DialogTitle>
              <DialogDescription>
                Bestätigen Sie Ihr Passwort. Die bestehenden Backup-Codes werden
                dabei ungültig.
              </DialogDescription>
            </DialogHeader>
            <div className="relative">
              <Input
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? 'text' : 'password'}
                disabled={isLoading}
                placeholder="Geben Sie Ihr Passwort ein"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void handleConfirm()
                }}
                autoFocus
                className="pr-9"
              />
              <Button
                className="absolute top-0 right-0 h-full px-3 hover:!bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                size="icon"
                type="button"
                disabled={isLoading}
                variant="ghost">
                {showPassword ? (
                  <EyeOffIcon className="text-muted-foreground" />
                ) : (
                  <EyeIcon className="text-muted-foreground" />
                )}
              </Button>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                disabled={isLoading}
                onClick={() => onOpenChange(false)}>
                Abbrechen
              </Button>
              <Button disabled={isLoading} onClick={handleConfirm}>
                Neu erstellen
              </Button>
            </DialogFooter>
          </>
        )}
        {step === 'backup' && (
          <BackupCodesStep
            backupCodes={codes}
            onDone={() => {
              onDone()
              onOpenChange(false)
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
