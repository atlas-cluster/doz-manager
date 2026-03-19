'use client'

import { EyeIcon, EyeOffIcon } from 'lucide-react'
import { ReactNode, useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import { userSchema } from '@/features/access-control/schemas/user'
import { AccessControlUser } from '@/features/access-control/types'
import { Button } from '@/features/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/features/shared/components/ui/dialog'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/features/shared/components/ui/field'
import { Input } from '@/features/shared/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'

interface UserDialogProps {
  user?: AccessControlUser
  trigger?: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSubmit?: (data: z.infer<typeof userSchema>) => Promise<unknown> | unknown
}

export function UserDialog({
  user,
  trigger,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  onSubmit,
}: UserDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const open = controlledOpen ?? internalOpen
  const setOpen = setControlledOpen ?? setInternalOpen
  const isEditing = !!user

  const form = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      email: '',
      image: '',
      password: '',
    },
  })

  useEffect(() => {
    if (open) {
      if (user) {
        form.reset({
          name: user.name,
          email: user.email,
          image: user.image ?? '',
          password: undefined,
        })
      } else {
        form.reset({ name: '', email: '', image: '', password: '' })
      }
      setShowPassword(false)
    }
  }, [user, form, open])

  async function handleSubmit(data: z.infer<typeof userSchema>) {
    await onSubmit?.({
      ...data,
      password: data.password || undefined,
    })
    setOpen(false)
    form.reset()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className={'max-h-[85vh] overflow-y-auto'}>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Benutzer bearbeiten' : 'Benutzer erstellen'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Hier können Sie einen bestehenden Benutzer bearbeiten.'
              : 'Hier können Sie einen neuen Benutzer anlegen.'}
          </DialogDescription>
        </DialogHeader>
        <form
          id="user-form"
          onSubmit={form.handleSubmit(handleSubmit)}
          className={'space-y-4'}>
          <FieldGroup>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Controller
                name={'name'}
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="name">
                      <span>
                        Name<sup className={'text-destructive'}>*</sup>
                      </span>
                    </FieldLabel>
                    <Input
                      id="name"
                      placeholder="Max Mustermann"
                      {...field}
                      aria-invalid={fieldState.invalid}
                      autoComplete={'off'}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name={'email'}
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="email">
                      <span>
                        E-Mail<sup className={'text-destructive'}>*</sup>
                      </span>
                    </FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      placeholder="benutzer@example.com"
                      {...field}
                      aria-invalid={fieldState.invalid}
                      autoComplete={'off'}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name={'image'}
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="image">
                      <span>Profilbild-URL</span>
                    </FieldLabel>
                    <Input
                      id="image"
                      type="url"
                      placeholder="https://example.com/avatar.png"
                      {...field}
                      value={field.value ?? ''}
                      aria-invalid={fieldState.invalid}
                      autoComplete={'off'}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {!isEditing && (
                <Controller
                  name={'password'}
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="password">
                        <span>Passwort</span>
                      </FieldLabel>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          className="pr-9"
                          {...field}
                          aria-invalid={fieldState.invalid}
                          autoComplete={'new-password'}
                        />
                        <Button
                          className="absolute top-0 right-0 h-full px-3 hover:!bg-transparent"
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
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              )}
            </div>

            <div className="mt-4 flex justify-end">
              <Button type="submit">
                {isEditing ? 'Speichern' : 'Erstellen'}
              </Button>
            </div>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  )
}
