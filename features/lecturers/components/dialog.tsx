import { Check, ChevronsUpDown } from 'lucide-react'
import { ReactNode, useEffect, useState, useTransition } from 'react'
import { Controller, useForm } from 'react-hook-form'
import z from 'zod'

import { Course, getCourses } from '@/features/courses'
import { createLecturerCourseAssignment } from '@/features/lecturers/actions/create-lecturer-course-assignment'
import { deleteLecturerCourseAssignment } from '@/features/lecturers/actions/delete-lecturer-course-assignment'
import { getLecturerCourseAssignments } from '@/features/lecturers/actions/get-lecturer-course-assignments'
import { lecturerSchema } from '@/features/lecturers/schemas/lecturer'
import { Lecturer } from '@/features/lecturers/types'
import { Button } from '@/features/shared/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/features/shared/components/ui/command'
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/features/shared/components/ui/popover'
import { ScrollArea } from '@/features/shared/components/ui/scroll-area'
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
import { cn } from '@/features/shared/lib/utils'
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
  const [lecturerCourses, setLecturerCourses] = useState<Course[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  const openDialog = controlledOpen ?? internalOpen
  const setDialogOpen = setControlledOpen ?? setInternalOpen
  const isEditing = !!lecturer

  const [openCourseSelect, setCourseSelectOpen] = useState(false)
  const [courseSelectedValues, setCourseSelectedValues] = useState<Course[]>([])

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

  const [isPending, startTransition] = useTransition()

  const handleAssignmentCreate = (lecturerId: string, courseId: string) => {
    startTransition(async () => {
      await createLecturerCourseAssignment(lecturerId, courseId)
      const refreshed = await getLecturerCourseAssignments(lecturerId)
      setCourseSelectedValues(refreshed)
    })
  }

  const handleAssignmentDelete = (lecturerId: string, courseId: string) => {
    startTransition(async () => {
      await deleteLecturerCourseAssignment(lecturerId, courseId)
      const refreshed = await getLecturerCourseAssignments(lecturerId)
      setCourseSelectedValues(refreshed)
    })
  }

  useEffect(() => {
    if (!openDialog) {
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
          const lecturerCourses = await getLecturerCourseAssignments(
            lecturer.id
          )
          const courses = await getCourses({
            pageIndex: 0,
            pageSize: 999999999,
          })
          if (!canceled) {
            setLecturerCourses(lecturerCourses)
            setCourses(courses.data)
            setCourseSelectedValues(lecturerCourses)
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
  }, [lecturer, form, openDialog])

  async function handleSubmit(data: z.infer<typeof lecturerSchema>) {
    await onSubmit?.(data)
    setDialogOpen(false)
    form.reset()
  }

  const courseSelectOptions = courses.map((course) => ({
    value: course.id,
    label: course.name,
  }))

  return (
    <Dialog open={openDialog} onOpenChange={setDialogOpen}>
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
            <Popover onOpenChange={setCourseSelectOpen} open={openCourseSelect}>
              <PopoverTrigger asChild className="space-y-2 mb-4">
                <Button
                  aria-expanded={openCourseSelect}
                  className="w-[250px] justify-between"
                  role="combobox"
                  variant="outline">
                  {courseSelectedValues.length > 1
                    ? `${courseSelectedValues.length} Kurs(e) ausgewählt`
                    : courseSelectedValues.length === 1
                      ? `${courseSelectedValues.length} Kurs ausgewählt`
                      : 'Kurse auswählen...'}
                  <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[250px] p-0">
                <Command>
                  <CommandInput placeholder="Suche Kurse..." />
                  <ScrollArea className="h-64 w-full">
                    <CommandList>
                      <CommandEmpty>Keine Kurse gefunden.</CommandEmpty>
                      <CommandGroup>
                        {courseSelectOptions.map((topic) => (
                          <CommandItem
                            key={topic.value}
                            onSelect={(currentValue) => {
                              courseSelectedValues
                                .map((course) => course.id)
                                .includes(currentValue)
                                ? handleAssignmentDelete(
                                    lecturer!.id,
                                    topic.value
                                  )
                                : handleAssignmentCreate(
                                    lecturer!.id,
                                    topic.value
                                  )
                            }}
                            value={topic.value}>
                            <Check
                              className={cn(
                                'mr-2 size-4',
                                courseSelectedValues
                                  .map((course) => course.id)
                                  .includes(topic.value)
                                  ? 'opacity-100'
                                  : 'opacity-0'
                              )}
                            />
                            {topic.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </ScrollArea>
                </Command>
              </PopoverContent>
            </Popover>
            <ScrollArea className="h-[400px]">
              <ItemGroup className="grid grid-cols-2 gap-4 p-2">
                {loading ? (
                  <Item key="loading" variant="outline">
                    Lade Kurse...
                  </Item>
                ) : courseSelectedValues.length > 0 ? (
                  courseSelectedValues.map((course) => (
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
            </ScrollArea>
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
