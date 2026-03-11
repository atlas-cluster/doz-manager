'use client'

import { EyeIcon, EyeOffIcon } from 'lucide-react'
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
import { Input } from '@/features/shared/components/ui/input'

type PasswordDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel: string
  confirmVariant?: 'default' | 'destructive'
  isLoading: boolean
  onConfirm: (password: string) => Promise<void>
}

export function PasswordDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  confirmVariant = 'default',
  isLoading,
  onConfirm,
}: PasswordDialogProps) {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleConfirm = async () => {
    if (!password) {
      toast.error('Bitte geben Sie Ihr Passwort ein.')
      return
    }
    await onConfirm(password)
    setPassword('')
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!isLoading) {
          setPassword('')
          onOpenChange(v)
        }
      }}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
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
            className="absolute top-0 right-0 h-full px-3 hover:bg-transparent!"
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
            onClick={() => {
              setPassword('')
              onOpenChange(false)
            }}>
            Abbrechen
          </Button>
          <Button
            variant={confirmVariant}
            disabled={isLoading}
            onClick={handleConfirm}>
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
