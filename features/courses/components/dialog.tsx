'use client'

import { ReactNode, useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import { courseSchema } from '@/features/courses/schemas/course'
import { Course } from '@/features/courses/types'
import { NumberInput } from '@/features/shared/components/number-input'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/features/shared/components/ui/select'
import { Switch } from '@/features/shared/components/ui/switch'
import { zodResolver } from '@hookform/resolvers/zod'

interface CourseDialogProps {
  course?: Course
  trigger?: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSubmit?: (data: z.infer<typeof courseSchema>) => Promise<unknown> | unknown
}

export function CourseDialog({
  course,
  trigger,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  onSubmit,
}: CourseDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)

  const open = controlledOpen ?? internalOpen
  const setOpen = setControlledOpen ?? setInternalOpen
  const isEditing = !!course

  const form = useForm<z.infer<typeof courseSchema>>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      name: '',
      isOpen: true,
      courseLevel: 'bachelor',
      semester: null,
    },
  })

  useEffect(() => {
    if (open) {
      if (course) {
        form.reset({
          name: course.name,
          isOpen: course.isOpen,
          courseLevel: course.courseLevel,
          semester: course.semester,
        })
      } else {
        form.reset()
      }
    }
  }, [course, form, open])

  async function handleSubmit(data: z.infer<typeof courseSchema>) {
    await onSubmit?.(data)
    setOpen(false)
    form.reset()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className={'max-h-[85vh] overflow-y-auto'}>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Vorlesung bearbeiten' : 'Vorlesung erstellen'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Hier können Sie eine bestehende Vorlesung bearbeiten.'
              : 'Hier können Sie eine neue Vorlesung anlegen.'}
          </DialogDescription>
        </DialogHeader>
        <form
          id="course-form"
          onSubmit={form.handleSubmit(handleSubmit)}
          className={'space-y-3'}>
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
                      placeholder="Grundlagen der Informatik"
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
                name={'semester'}
                control={form.control}
                render={({ field, fieldState }) => {
                  return (
                    <Field data-invalid={fieldState.invalid}>
                      <div className={'flex gap-2'}>
                        <FieldLabel htmlFor="semester">
                          <span>
                            Semester
                            <sup className={'text-destructive'}>*</sup>
                          </span>
                        </FieldLabel>
                        <Switch
                          checked={field.value !== null}
                          onCheckedChange={(checked) => {
                            if (!checked) {
                              field.onChange(null)
                            } else if (field.value === null) {
                              field.onChange(1)
                            }
                          }}
                        />
                      </div>
                      <NumberInput
                        {...field}
                        disabled={field.value === null}
                        min={1}
                        max={12}
                        className="w-full"
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )
                }}
              />

              <Controller
                name={'courseLevel'}
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="courseLevel">
                      <span>
                        Vorlesungsstufe
                        <sup className={'text-destructive'}>*</sup>
                      </span>
                    </FieldLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Wählen Sie eine Stufe" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bachelor">Bachelor</SelectItem>
                        <SelectItem value="master">Master</SelectItem>
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name={'isOpen'}
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="isOpen">
                      <span>
                        Status<sup className={'text-destructive'}>*</sup>
                      </span>
                    </FieldLabel>
                    <Select
                      onValueChange={(val) => field.onChange(val === 'true')}
                      defaultValue={field.value ? 'true' : 'false'}>
                      <SelectTrigger>
                        <SelectValue placeholder="Status wählen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Offen</SelectItem>
                        <SelectItem value="false">Geschlossen</SelectItem>
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
