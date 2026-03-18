'use client'

import { Button } from '@/features/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/features/shared/components/ui/dialog'

type PasskeyRevokeDialogProps = {
  open: boolean
  onOpenChangeAction: (open: boolean) => void
  isLoading: boolean
  passkeyName: string
  onConfirmAction: () => Promise<void>
}

export function PasskeyRevokeDialog({
  open,
  onOpenChangeAction,
  isLoading,
  passkeyName,
  onConfirmAction,
}: PasskeyRevokeDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!isLoading) {
          onOpenChangeAction(next)
        }
      }}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Passkey widerrufen</DialogTitle>
          <DialogDescription>
            Möchten Sie den Passkey "{passkeyName}" wirklich widerrufen? Die
            Anmeldung mit diesem Gerät ist danach nicht mehr möglich.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            disabled={isLoading}
            onClick={() => onOpenChangeAction(false)}>
            Abbrechen
          </Button>
          <Button
            variant="destructive"
            disabled={isLoading}
            onClick={() => void onConfirmAction()}>
            Widerrufen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
