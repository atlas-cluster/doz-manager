'use client'

import { Minus, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import { createCourse } from '@/features/courses/actions/create'
import { updateCourse } from '@/features/courses/actions/update'
import { courseSchema } from '@/features/courses/schemas/course.schema'
import { Course } from '@/features/courses/types'
import { Button } from '@/features/shared/components/ui/button'
import { ButtonGroup } from '@/features/shared/components/ui/button-group'
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
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function CourseDialog({
  course,
  trigger,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
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
        form.reset({
          name: '',
          isOpen: true,
          courseLevel: 'bachelor',
          semester: null,
        })
      }
    }
  }, [course, form, open])

  function onSubmit(data: z.infer<typeof courseSchema>) {
    const promise = isEditing
      ? updateCourse(course!.id, data)
      : createCourse(data)

    promise.then(() => {
      setOpen(false)
      form.reset()
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent>
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
          onSubmit={form.handleSubmit(onSubmit)}
          className={'space-y-3'}>
          <FieldGroup>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Controller
                name={'name'}
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="col-span-2">
                    <FieldLabel htmlFor="name">
                      <span>
                        Name<sup className={'text-destructive'}>*</sup>
                      </span>
                    </FieldLabel>
                    <Input
                      id="name"
                      placeholder="Einführung in..."
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
                name={'semester'}
                control={form.control}
                render={({ field, fieldState }) => {
                  const isSemesterEnabled = field.value !== null
                  const currentValue =
                    field.value !== null && !Number.isNaN(field.value)
                      ? field.value
                      : 1

                  return (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="semester">
                        <span>
                          Semester<sup className={'text-destructive'}>*</sup>
                        </span>
                      </FieldLabel>
                      <div className="mb-2 flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          Hat Semester?
                        </span>
                        <Switch
                          checked={isSemesterEnabled}
                          onCheckedChange={(checked) => {
                            if (!checked) {
                              // Disable semester: represent as null
                              field.onChange(null)
                            } else if (field.value === null) {
                              // Enable semester: start at 1
                              field.onChange(1)
                            }
                          }}
                        />
                      </div>
                      <ButtonGroup>
                        <Button
                          type={'button'}
                          variant={'outline'}
                          size={'icon'}
                          disabled={!isSemesterEnabled || currentValue <= 1}
                          onClick={() => {
                            if (!isSemesterEnabled) return
                            const next = Math.max(1, currentValue - 1)
                            field.onChange(next)
                          }}>
                          <Minus />
                          <span className={'sr-only'}>Semester verringern</span>
                        </Button>
                        <Input
                          id="semester"
                          disabled={!isSemesterEnabled}
                          placeholder="1"
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value
                            if (value === '') {
                              field.onChange(NaN)
                              return
                            }
                            const parsed = parseInt(value, 10)
                            if (Number.isNaN(parsed)) {
                              field.onChange(NaN)
                              return
                            }
                            const clamped = Math.min(12, Math.max(1, parsed))
                            field.onChange(clamped)
                          }}
                          value={
                            field.value === null || Number.isNaN(field.value)
                              ? ''
                              : field.value
                          }
                          aria-invalid={fieldState.invalid}
                          autoComplete={'off'}
                        />
                        <Button
                          variant={'outline'}
                          size={'icon'}
                          type={'button'}
                          disabled={!isSemesterEnabled || currentValue >= 12}
                          onClick={() => {
                            if (!isSemesterEnabled) return
                            const next = Math.min(12, currentValue + 1)
                            field.onChange(next)
                          }}>
                          <Plus />
                          <span className={'sr-only'}>Semester erhöhen</span>
                        </Button>
                      </ButtonGroup>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )
                }}
              />

              <div aria-hidden="true" className="hidden sm:block"></div>

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
