'use client'

import { EyeIcon, EyeOffIcon } from 'lucide-react'
import { useState } from 'react'
import { z } from 'zod'

import { Button } from '@/features/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/features/shared/components/ui/dialog'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/features/shared/components/ui/field'
import { Input } from '@/features/shared/components/ui/input'

const passwordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Das Passwort muss mindestens 8 Zeichen lang sein.')
      .max(128, 'Das Passwort darf maximal 128 Zeichen lang sein.'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Die Passwörter stimmen nicht überein.',
    path: ['confirmPassword'],
  })

interface ChangePasswordDialogProps {
  userName: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (newPassword: string) => void
}

export function ChangePasswordDialog({
  userName,
  open,
  onOpenChange,
  onSubmit,
}: ChangePasswordDialogProps) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [errors, setErrors] = useState<{
    password?: string
    confirmPassword?: string
  }>({})

  function resetState() {
    setPassword('')
    setConfirmPassword('')
    setShowPassword(false)
    setShowConfirm(false)
    setErrors({})
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const result = passwordSchema.safeParse({ password, confirmPassword })
    if (!result.success) {
      const fieldErrors: { password?: string; confirmPassword?: string } = {}
      for (const issue of result.error.issues) {
        const field = issue.path[0] as string
        if (!fieldErrors[field as keyof typeof fieldErrors]) {
          fieldErrors[field as keyof typeof fieldErrors] = issue.message
        }
      }
      setErrors(fieldErrors)
      return
    }
    onSubmit(password)
    resetState()
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) resetState()
        onOpenChange(v)
      }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Passwort ändern</DialogTitle>
          <DialogDescription>
            Neues Passwort für {userName} festlegen.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <FieldGroup>
            <Field data-invalid={!!errors.password}>
              <FieldLabel htmlFor="new-password">
                <span>
                  Neues Passwort<sup className="text-destructive">*</sup>
                </span>
              </FieldLabel>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pr-9"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setErrors((prev) => ({ ...prev, password: undefined }))
                  }}
                  autoComplete="new-password"
                />
                <Button
                  className="absolute top-0 right-0 h-full px-3 hover:bg-transparent!"
                  onClick={() => setShowPassword(!showPassword)}
                  size="icon"
                  type="button"
                  variant="ghost">
                  {showPassword ? (
                    <EyeOffIcon className="text-muted-foreground" />
                  ) : (
                    <EyeIcon className="text-muted-foreground" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <FieldError errors={[{ message: errors.password }]} />
              )}
            </Field>
            <Field data-invalid={!!errors.confirmPassword}>
              <FieldLabel htmlFor="confirm-password">
                <span>
                  Passwort bestätigen<sup className="text-destructive">*</sup>
                </span>
              </FieldLabel>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pr-9"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value)
                    setErrors((prev) => ({
                      ...prev,
                      confirmPassword: undefined,
                    }))
                  }}
                  autoComplete="new-password"
                />
                <Button
                  className="absolute top-0 right-0 h-full px-3 hover:bg-transparent!"
                  onClick={() => setShowConfirm(!showConfirm)}
                  size="icon"
                  type="button"
                  variant="ghost">
                  {showConfirm ? (
                    <EyeOffIcon className="text-muted-foreground" />
                  ) : (
                    <EyeIcon className="text-muted-foreground" />
                  )}
                </Button>
              </div>
              {errors.confirmPassword && (
                <FieldError errors={[{ message: errors.confirmPassword }]} />
              )}
            </Field>
            <div className="flex justify-end">
              <Button type="submit">Passwort ändern</Button>
            </div>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  )
}
