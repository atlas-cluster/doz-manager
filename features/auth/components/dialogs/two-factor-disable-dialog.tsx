'use client'

import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/features/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/features/shared/components/ui/dialog'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/features/shared/components/ui/input-otp'

type TwoFactorDisableDialogProps = {
  open: boolean
  onOpenChangeAction: (open: boolean) => void
  isLoading: boolean
  onConfirmAction: (code: string) => Promise<void>
}

export function TwoFactorDisableDialog({
  open,
  onOpenChangeAction,
  isLoading,
  onConfirmAction,
}: TwoFactorDisableDialogProps) {
  const [code, setCode] = useState('')

  const reset = () => {
    setCode('')
  }

  const handleConfirm = async () => {
    if (code.length !== 6) {
      toast.error('Bitte geben Sie einen gueltigen 6-stelligen Code ein.')
      return
    }

    await onConfirmAction(code)
    reset()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!isLoading) {
          reset()
          onOpenChangeAction(v)
        }
      }}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>2FA-Code bestaetigen</DialogTitle>
          <DialogDescription>
            Geben Sie den 6-stelligen Code aus Ihrer Authenticator-App ein.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center">
          <InputOTP
            maxLength={6}
            value={code}
            onChange={(val) => setCode(val.replace(/\D/g, ''))}
            disabled={isLoading}
            inputMode="numeric"
            pattern="[0-9]*">
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            disabled={isLoading}
            onClick={() => {
              reset()
              onOpenChangeAction(false)
            }}>
            Abbrechen
          </Button>
          <Button
            variant="destructive"
            disabled={isLoading}
            onClick={() => void handleConfirm()}>
            Deaktivieren
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
