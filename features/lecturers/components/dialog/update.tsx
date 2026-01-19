'use client'

import { updateLecturer } from '../../actions/update'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import { createLecturer } from '@/features/lecturers/actions/create'
import { lecturerSchema } from '@/features/lecturers/schemas/lecturer.schema'
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
import { PhoneInput } from '@/features/shared/components/ui/phone-input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/features/shared/components/ui/select'
import { zodResolver } from '@hookform/resolvers/zod'

export function UpdateDialog({
  lecturerId,
  lecturerData,
}: {
  lecturerId: string
  lecturerData: z.infer<typeof lecturerSchema>
}) {
  const [open, setOpen] = useState(false)

  const form = useForm<z.infer<typeof lecturerSchema>>({
    resolver: zodResolver(lecturerSchema),
    defaultValues: lecturerData,
  })

  useEffect(() => {
    if (!open) {
      form.reset()
    }
  }, [form, open])

  function onSubmit(data: z.infer<typeof lecturerSchema>) {
    updateLecturer(lecturerId, lecturerData).then(() => {
      setOpen(false)
      form.reset()
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setOpen(true)} suppressHydrationWarning>
          Dozent bearbeiten
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dozent bearbeiten</DialogTitle>
          <DialogDescription>
            Hier können Sie den Dozenten bearbeiten.
          </DialogDescription>
        </DialogHeader>
        <form
          id="create-lecturer"
          onSubmit={form.handleSubmit(onSubmit)}
          className={'space-y-3'}>
          <FieldGroup>
            <div className="grid grid-cols-2 gap-3">
              <Controller
                name={'title'}
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="title">Titel</FieldLabel>
                    <Input
                      id="title"
                      placeholder="Prof."
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

              <Controller
                name={'firstName'}
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="firstName">
                      <span>
                        Vorname<sup className={'text-destructive'}>*</sup>
                      </span>
                    </FieldLabel>
                    <Input
                      id="firstName"
                      placeholder="Vorname"
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
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Controller
                name={'secondName'}
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="secondName">
                      <span>Zweiter Vorname</span>
                    </FieldLabel>
                    <Input
                      id="secondName"
                      placeholder="Zweiter Vorname"
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

              <Controller
                name={'lastName'}
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="lastName">
                      <span>
                        Nachname<sup className={'text-destructive'}>*</sup>
                      </span>
                    </FieldLabel>
                    <Input
                      id="lastName"
                      placeholder="Nachname"
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
            </div>

            <div className="grid grid-cols-2 gap-3">
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
                      placeholder="beispiel@mail.de"
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
                name={'phone'}
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="phone">
                      <span>
                        Telefonnummer<sup className={'text-destructive'}>*</sup>
                      </span>
                    </FieldLabel>
                    <PhoneInput
                      id={'phone'}
                      {...field}
                      onChange={field.onChange}
                      defaultCountry={'DE'}
                      international
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Controller
                name={'type'}
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="type">
                      <span>
                        Dozententyp<sup className={'text-destructive'}>*</sup>
                      </span>
                    </FieldLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Wählen Sie einen Typ" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="internal">Intern</SelectItem>
                        <SelectItem value="external">Extern</SelectItem>
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name={'courseLevelPreference'}
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="courseLevelPreference">
                      <span>
                        Vorlesungspräferenz
                        <sup className={'text-destructive'}>*</sup>
                      </span>
                    </FieldLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Wählen Sie die Vorlesungspräferenz" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bachelor">Bachelor</SelectItem>
                        <SelectItem value="master">Master</SelectItem>
                        <SelectItem value="both">Beides</SelectItem>
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>
            <div className="mt-4 flex justify-end">
              <Button type="submit">Bearbeiten</Button>
            </div>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  )
}
