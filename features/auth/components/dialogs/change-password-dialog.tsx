'use client'

import { EyeIcon, EyeOffIcon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

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

type ChangePasswordDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ChangePasswordDialog({
  open,
  onOpenChange,
}: ChangePasswordDialogProps) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const reset = () => {
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setShowCurrent(false)
    setShowNew(false)
    setShowConfirm(false)
  }

  const handleSubmit = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Bitte füllen Sie alle Felder aus.')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('Die Passwörter stimmen nicht überein.')
      return
    }
    if (newPassword.length < 8) {
      toast.error('Das neue Passwort muss mindestens 8 Zeichen lang sein.')
      return
    }

    setIsLoading(true)
    try {
      const changePasswordPromise = authClient
        .changePassword({
          currentPassword,
          newPassword,
          revokeOtherSessions: false,
        })
        .then(({ error }) => {
          if (error) {
            throw new Error(
              'Passwort konnte nicht geändert werden. Prüfen Sie Ihr aktuelles Passwort.'
            )
          }
        })

      toast.promise(changePasswordPromise, {
        loading: 'Passwort wird geändert...',
        success: 'Passwort wurde geändert.',
        error: (error) =>
          error instanceof Error
            ? error.message
            : 'Passwort konnte nicht geändert werden.',
      })

      await changePasswordPromise
      reset()
      onOpenChange(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!isLoading) {
          reset()
          onOpenChange(v)
        }
      }}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Passwort ändern</DialogTitle>
          <DialogDescription>
            Geben Sie Ihr aktuelles Passwort und ein neues Passwort ein.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div className="space-y-1.5">
            <p className="text-sm font-medium">Aktuelles Passwort</p>
            <div className="relative">
              <Input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Aktuelles Passwort"
                className="pr-9"
              />
              <Button
                className="absolute top-0 right-0 h-full px-3 hover:!bg-transparent"
                onClick={() => setShowCurrent(!showCurrent)}
                size="icon"
                type="button"
                disabled={isLoading}
                variant="ghost">
                {showCurrent ? (
                  <EyeOffIcon className="text-muted-foreground" />
                ) : (
                  <EyeIcon className="text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>
          <div className="space-y-1.5">
            <p className="text-sm font-medium">Neues Passwort</p>
            <div className="relative">
              <Input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mindestens 8 Zeichen"
                className="pr-9"
              />
              <Button
                className="absolute top-0 right-0 h-full px-3 hover:!bg-transparent"
                onClick={() => setShowNew(!showNew)}
                size="icon"
                type="button"
                disabled={isLoading}
                variant="ghost">
                {showNew ? (
                  <EyeOffIcon className="text-muted-foreground" />
                ) : (
                  <EyeIcon className="text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>
          <div className="space-y-1.5">
            <p className="text-sm font-medium">Passwort bestätigen</p>
            <div className="relative">
              <Input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Passwort wiederholen"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void handleSubmit()
                }}
                className="pr-9"
              />
              <Button
                className="absolute top-0 right-0 h-full px-3 hover:!bg-transparent"
                onClick={() => setShowConfirm(!showConfirm)}
                size="icon"
                type="button"
                disabled={isLoading}
                variant="ghost">
                {showConfirm ? (
                  <EyeOffIcon className="text-muted-foreground" />
                ) : (
                  <EyeIcon className="text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            disabled={isLoading}
            onClick={() => {
              reset()
              onOpenChange(false)
            }}>
            Abbrechen
          </Button>
          <Button disabled={isLoading} onClick={handleSubmit}>
            Passwort ändern
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
