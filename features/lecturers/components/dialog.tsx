import { ReactNode, useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import z from 'zod'

import { Course } from '@/features/courses/types'
import { getCoursesByLecturerId } from '@/features/lecturers/actions/get'
import { lecturerSchema } from '@/features/lecturers/schemas/lecturer'
import { Lecturer } from '@/features/lecturers/types'
import { Button } from '@/features/shared/components/ui/button'
import {
  Dialog,
  DialogHeader,
  DialogTrigger,
} from '@/features/shared/components/ui/dialog'
import {
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/features/shared/components/ui/dialog'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/features/shared/components/ui/field'
import { Input } from '@/features/shared/components/ui/input'
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from '@/features/shared/components/ui/item'
import { PhoneInput } from '@/features/shared/components/ui/phone-input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/features/shared/components/ui/select'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/features/shared/components/ui/tabs'
import { zodResolver } from '@hookform/resolvers/zod'

interface LecturerDialogProps {
  lecturer?: Lecturer
  trigger?: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSubmit?: (
    data: z.infer<typeof lecturerSchema>
  ) => Promise<unknown> | unknown
}

export function LecturerDialog({
  lecturer,
  trigger,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  onSubmit,
}: LecturerDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  const open = controlledOpen ?? internalOpen
  const setOpen = setControlledOpen ?? setInternalOpen
  const isEditing = !!lecturer

  const form = useForm<z.infer<typeof lecturerSchema>>({
    resolver: zodResolver(lecturerSchema),
    defaultValues: {
      title: null,
      firstName: '',
      secondName: null,
      lastName: '',
      email: '',
      phone: '',
      type: 'internal',
      courseLevelPreference: 'both',
    },
  })

  useEffect(() => {
    if (!open) {
      return
    }

    if (lecturer) {
      form.reset({
        title: lecturer.title,
        firstName: lecturer.firstName,
        secondName: lecturer.secondName,
        lastName: lecturer.lastName,
        email: lecturer.email,
        phone: lecturer.phone,
        type: lecturer.type,
        courseLevelPreference: lecturer.courseLevelPreference,
      })
    } else {
      form.reset()
    }

    let canceled = false

    const load = async () => {
      setLoading(true)
      try {
        if (lecturer?.id) {
          const courses = await getCoursesByLecturerId(lecturer.id)
          if (!canceled) {
            setCourses(courses)
          }
        } else if (!canceled) {
          setCourses([])
        }
      } finally {
        if (!canceled) {
          setLoading(false)
        }
      }
    }

    void load()

    return () => {
      canceled = true
    }
  }, [lecturer, form, open])

  async function handleSubmit(data: z.infer<typeof lecturerSchema>) {
    await onSubmit?.(data)
    setOpen(false)
    form.reset()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Dozent bearbeiten' : 'Dozent erstellen'}
          </DialogTitle>
          <DialogDescription>
            {lecturer?.title ? lecturer.title + ' ' : ''}
            {lecturer?.firstName}
            {lecturer?.secondName ? ' ' + lecturer.secondName : ''}{' '}
            {lecturer?.lastName}
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="courses">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="courses">Vorlesungen</TabsTrigger>
          </TabsList>
          <TabsContent value="courses">
            <ItemGroup className="gap-4">
              {loading ? (
                <Item key="loading" variant="outline">
                  Lade Kurse...
                </Item>
              ) : courses.length > 0 ? (
                courses.map((course) => (
                  <Item key={course.id} variant="outline">
                    <ItemContent>
                      <ItemTitle>{course.name}</ItemTitle>
                      <ItemDescription>
                        {course.courseLevel == 'bachelor'
                          ? 'Bachelor'
                          : 'Master'}{' '}
                        | {course.semester}. Semester
                      </ItemDescription>
                    </ItemContent>
                  </Item>
                ))
              ) : (
                <Item key="empty" variant="outline">
                  Keine Kurse
                </Item>
              )}
            </ItemGroup>
          </TabsContent>
          <TabsContent value="details">
            <form
              id="lecturer-form"
              onSubmit={form.handleSubmit(handleSubmit)}
              className={'space-y-3'}>
              <FieldGroup>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
                            Telefonnummer
                            <sup className={'text-destructive'}>*</sup>
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
                            Dozententyp
                            <sup className={'text-destructive'}>*</sup>
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
                  <Button type="submit">
                    {isEditing ? 'Speichern' : 'Erstellen'}
                  </Button>
                </div>
              </FieldGroup>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
