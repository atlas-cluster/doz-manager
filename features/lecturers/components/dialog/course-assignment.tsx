import {
  ChevronsUpDown,
  CircleQuestionMark,
  Pencil,
  PencilRuler,
  Trash2,
} from 'lucide-react'
import { ReactNode, useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import z from 'zod'

import { Course, CourseQualification, getCourses } from '@/features/courses'
import { Lecturer } from '@/features/lecturers'
import { createLecturerCourseAssignment } from '@/features/lecturers/actions/create-lecturer-course-assignment'
import { deleteLecturerCourseAssignment } from '@/features/lecturers/actions/delete-lecturer-course-assignment'
import { deleteLecturerCourseQualification } from '@/features/lecturers/actions/delete-lecturer-course-qualification'
import { getLecturerCourseAssignments } from '@/features/lecturers/actions/get-lecturer-course-assignments'
import { getLecturerCourseQualifications } from '@/features/lecturers/actions/get-lecturer-course-qualification'
import { upsertLecturerQualification } from '@/features/lecturers/actions/upsert-lecturer-course-qualification'
import { EditQualificationDialog } from '@/features/lecturers/components/dialog/course-qualification'
import { qualificationSchema } from '@/features/lecturers/schemas/lecturer'
import { Avatar, AvatarFallback } from '@/features/shared/components/ui/avatar'
import { Button } from '@/features/shared/components/ui/button'
import { Checkbox } from '@/features/shared/components/ui/checkbox'
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
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/features/shared/components/ui/dialog'
import {
  Empty,
  EmptyDescription,
  EmptyMedia,
  EmptyTitle,
} from '@/features/shared/components/ui/empty'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from '@/features/shared/components/ui/item'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/features/shared/components/ui/popover'
import { ScrollArea } from '@/features/shared/components/ui/scroll-area'
import { Skeleton } from '@/features/shared/components/ui/skeleton'
import { initialsFromName } from '@/features/shared/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import '@radix-ui/react-avatar'

interface CourseAssignmentProps {
  lecturer: Lecturer
  trigger?: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSubmit?: () => void
  readonly?: boolean
}

export function CourseAssignmentDialog({
  lecturer,
  trigger,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  onSubmit,
  readonly = false,
}: CourseAssignmentProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [readonlyMode, setReadonlyMode] = useState(readonly)
  const [viewMode, setViewMode] = useState<'selection' | 'all'>('selection')

  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourses, setSelectedCourses] = useState<Course[]>([])
  const [courseQualifications, setCourseQualifications] = useState<
    CourseQualification[]
  >([])

  const open = controlledOpen ?? internalOpen
  const setOpen = setControlledOpen ?? setInternalOpen

  const fetchQualifications = async () => {
    try {
      setLoading(true)
      const qualificationsResponse = await getLecturerCourseQualifications(
        lecturer.id
      )
      setCourseQualifications(qualificationsResponse)
    } catch (error) {
      console.error('Failed to fetch qualifications', error)
      toast.error('Erfahrung/Vorlaufzeit konnten nicht geladen werden')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [coursesResponse, assignmentsResponse, qualificationsResponse] =
          await Promise.all([
            getCourses({ pageIndex: 0, pageSize: 999999999 }),
            getLecturerCourseAssignments(lecturer.id),
            getLecturerCourseQualifications(lecturer.id),
          ])
        setCourses(coursesResponse.data)
        setSelectedCourses(assignmentsResponse)
        setCourseQualifications(qualificationsResponse)
      } catch (error) {
        console.error('Failed to fetch data', error)
        toast.error('Daten konnten nicht geladen werden')
      } finally {
        setLoading(false)
      }
    }
    if (open) {
      fetchData()
      setReadonlyMode(readonly)
      setViewMode('selection')
    }
  }, [lecturer.id, open, readonly])

  const toggleCourse = (courseId: string) => {
    if (selectedCourses.some((c) => c.id === courseId)) {
      setSelectedCourses(selectedCourses.filter((c) => c.id !== courseId))
    } else {
      const course = courses.find((c) => c.id === courseId)
      if (course) {
        setSelectedCourses([...selectedCourses, course])
      }
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    const currentCourseIds = selectedCourses.map((c) => c.id)
    const originalCourseIds = (
      await getLecturerCourseAssignments(lecturer.id)
    ).map((c) => c.id)

    const coursesToAdd = currentCourseIds.filter(
      (id) => !originalCourseIds.includes(id)
    )
    const coursesToRemove = originalCourseIds.filter(
      (id) => !currentCourseIds.includes(id)
    )

    const promise = Promise.all([
      ...coursesToAdd.map((courseId) =>
        createLecturerCourseAssignment(lecturer.id, courseId)
      ),
      ...coursesToRemove.map((courseId) => {
        deleteLecturerCourseAssignment(lecturer.id, courseId)
        deleteLecturerCourseQualification(lecturer.id, courseId)
      }),
    ])

    setIsSubmitting(false)
    onSubmit?.()
    setOpen(false)
    try {
      toast.promise(promise, {
        loading: 'Zuweisungen werden gespeichert...',
        success: 'Zuweisungen wurden gespeichert',
        error: 'Zuweisungen konnten nicht gespeichert werden',
      })
    } catch (error) {
      console.error('Failed to save assignments', error)
      toast.error('Zuweisungen konnten nicht gespeichert werden')
    } finally {
    }
  }

  function handleEditQualification(
    data: z.infer<typeof qualificationSchema>,
    courseId: string
  ): void {
    if (!selectedCourses.some((c) => c.id === courseId)) {
      toggleCourse(courseId)
    }

    const promise = upsertLecturerQualification(
      lecturer.id,
      courseId,
      data
    ).then(() => fetchQualifications())

    toast.promise(promise, {
      loading: 'Erfahrung und Vorlaufzeit wird aktualisiert...',
      success: 'Erfahrung und Vorlaufzeit erfolgreich aktualisiert',
      error: 'Fehler beim Aktualisieren der Erfahrung und Vorlaufzeit',
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent
        className={
          'flex h-[90vh] max-h-[90vh] min-w-[60vw] flex-col overflow-hidden'
        }>
        <DialogHeader className="sticky top-0 z-10 bg-background pb-2">
          <DialogTitle>
            {readonlyMode
              ? 'Vorlesungen ansehen - '
              : 'Vorlesungen zuordnen - '}
            {lecturer.title ? lecturer.title + ' ' : ''}
            {lecturer.firstName}
            {lecturer.secondName ? ' ' + lecturer.secondName : ''}
            {' ' + lecturer.lastName}
          </DialogTitle>
          <DialogDescription>
            {readonlyMode
              ? 'Die folgenden Vorlesungen sind diesem Dozenten zugeordnet'
              : 'Weisen Sie diesem Dozenten Vorlesungen zu'}
          </DialogDescription>
        </DialogHeader>
        <div className={'flex min-h-0 flex-1 flex-col gap-3'}>
          {loading ? (
            <>
              <Skeleton className="h-9 w-48" />
              <ScrollArea className="min-h-0 flex-1">
                <div className="grid grid-cols-[repeat(auto-fill,minmax(20rem,1fr))] gap-3">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Item key={index} variant={'outline'} size={'sm'}>
                      <ItemMedia>
                        <Skeleton className="h-10 w-10 rounded-full" />
                      </ItemMedia>
                      <ItemContent>
                        <Skeleton className="h-5.25 w-[60%]" />
                        <Skeleton className="h-[19.25px] w-[40%]" />
                      </ItemContent>
                    </Item>
                  ))}
                </div>
              </ScrollArea>
            </>
          ) : (
            <>
              {readonlyMode && (
                <Button
                  onClick={() => setReadonlyMode(!readonlyMode)}
                  variant={'outline'}
                  className="w-fit">
                  <PencilRuler />
                  In Bearbeitungsmodus wechseln
                </Button>
              )}
              {!readonlyMode && (
                <div className="flex gap-2">
                  <Popover modal>
                    <PopoverTrigger asChild>
                      <Button
                        variant={viewMode === 'all' ? 'outline' : 'outline'}
                        className={`w-fit ${viewMode === 'all' ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
                        suppressHydrationWarning
                        disabled={viewMode === 'all'}>
                        {selectedCourses.length >= 1
                          ? `${selectedCourses.length} Vorlesung${selectedCourses.length != 1 ? 'en' : ''} ausgewählt`
                          : 'Vorlesungen auswählen...'}
                        <ChevronsUpDown />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Suche Vorlesungen..." />
                        <CommandList>
                          <CommandEmpty>
                            Keine Vorlesungen gefunden.
                          </CommandEmpty>
                          <CommandGroup>
                            {courses.map((course) => (
                              <CommandItem
                                key={course.id}
                                onSelect={() => toggleCourse(course.id)}
                                value={course.id}>
                                <Checkbox
                                  checked={selectedCourses.some(
                                    (c) => c.id === course.id
                                  )}
                                  className="pointer-events-none"
                                />
                                {course.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>

                  <Button
                    variant={viewMode === 'all' ? 'default' : 'outline'}
                    onClick={() =>
                      setViewMode(viewMode === 'all' ? 'selection' : 'all')
                    }
                    className="w-fit">
                    {viewMode === 'all' ? '← Zur Auswahl' : 'Alle Vorlesungen'}
                  </Button>
                </div>
              )}

              {!readonlyMode && viewMode === 'all' ? (
                <ScrollArea className="min-h-0 flex-1">
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(20rem,1fr))] gap-3 p-2">
                    {courses.map((course) => {
                      const qual = courseQualifications.find(
                        (cq) => cq.courseId === course.id
                      )
                      const isAssigned = selectedCourses.some(
                        (sc) => sc.id === course.id
                      )
                      return (
                        <Item
                          key={course.id}
                          variant={'outline'}
                          size="sm"
                          className="flex flex-nowrap">
                          <ItemMedia className="flex justify-center items-center h-full">
                            <Avatar className="size-10">
                              <AvatarFallback>
                                {initialsFromName(course.name)}
                              </AvatarFallback>
                            </Avatar>
                          </ItemMedia>
                          <ItemContent className="flex-1">
                            <ItemTitle>{course.name}</ItemTitle>
                            <ItemDescription>
                              {course.courseLevel === 'bachelor'
                                ? 'Bachelor'
                                : 'Master'}{' '}
                              {course.semester
                                ? `| ${course.semester}. Semester`
                                : ''}
                            </ItemDescription>
                            {qual ? (
                              <ItemDescription className="text-sm text-muted-foreground">
                                {(() => {
                                  switch (qual.experience) {
                                    case 'none':
                                      return 'Keine'
                                    case 'other_uni':
                                      return 'Extern'
                                    case 'provadis':
                                      return 'Provadis'
                                    default:
                                      return 'N/A'
                                  }
                                })()}{' '}
                                |{' '}
                                {(() => {
                                  switch (qual.leadTime) {
                                    case 'four_weeks':
                                      return '4 Wochen'
                                    case 'short':
                                      return 'Sofort'
                                    case 'more_weeks':
                                      return 'Mehrere Wochen'
                                    default:
                                      return 'N/A'
                                  }
                                })()}
                              </ItemDescription>
                            ) : (
                              <ItemDescription className="text-sm text-muted-foreground italic">
                                Keine Qualifikation festgelegt
                              </ItemDescription>
                            )}
                          </ItemContent>
                          <ItemActions>
                            <EditQualificationDialog
                              trigger={
                                <Button variant="ghost" size="icon">
                                  <Pencil />
                                  <span className="sr-only">
                                    Erfahrung/Vorlaufzeit von {course.name}{' '}
                                    bearbeiten
                                  </span>
                                </Button>
                              }
                              onSubmit={handleEditQualification}
                              courseQualification={qual}
                              courseId={course.id}
                            />
                          </ItemActions>
                        </Item>
                      )
                    })}
                  </div>
                </ScrollArea>
              ) : selectedCourses.length > 0 ? (
                <ScrollArea className="min-h-0 flex-1">
                  <ItemGroup className="grid grid-cols-[repeat(auto-fill,minmax(20rem,1fr))] gap-3">
                    {selectedCourses.map((course) => (
                      <Item
                        key={course.id}
                        variant="outline"
                        size={'sm'}
                        className={'flex flex-nowrap'}>
                        <ItemMedia className="flex justify-center items-center h-full">
                          <Avatar className={'size-10'}>
                            <AvatarFallback>
                              {initialsFromName(course.name)}
                            </AvatarFallback>
                          </Avatar>
                        </ItemMedia>
                        <ItemContent>
                          <ItemTitle>{course.name}</ItemTitle>
                          <ItemDescription>
                            {course.courseLevel === 'bachelor'
                              ? 'Bachelor'
                              : 'Master'}{' '}
                            {course.semester
                              ? `|  ${course.semester}. Semester`
                              : ''}
                          </ItemDescription>
                          {(() => {
                            const experience = courseQualifications.find(
                              (cQ) => cQ.courseId === course.id
                            )?.experience
                            const leadTime = courseQualifications.find(
                              (cQ) => cQ.courseId === course.id
                            )?.leadTime
                            if (!experience && !leadTime) return null
                            return (
                              <ItemDescription>
                                {(() => {
                                  switch (experience) {
                                    case 'none':
                                      return 'Keine'
                                    case 'other_uni':
                                      return 'Extern'
                                    case 'provadis':
                                      return 'Provadis'
                                    default:
                                      return 'N/A'
                                  }
                                })()}{' '}
                                |{' '}
                                {(() => {
                                  switch (leadTime) {
                                    case 'four_weeks':
                                      return '4 Wochen'
                                    case 'short':
                                      return 'Sofort'
                                    case 'more_weeks':
                                      return 'Mehrere Wochen'
                                    default:
                                      return 'N/A'
                                  }
                                })()}
                              </ItemDescription>
                            )
                          })()}
                        </ItemContent>
                        {!readonlyMode && (
                          <ItemActions>
                            <EditQualificationDialog
                              trigger={
                                <Button variant={'ghost'} size={'icon'}>
                                  <Pencil />
                                  <span className={'sr-only'}>
                                    {'Erfahrung/Vorlaufzeit von ' +
                                      course.name +
                                      '  bearbeiten'}
                                  </span>
                                </Button>
                              }
                              onSubmit={handleEditQualification}
                              courseQualification={courseQualifications.find(
                                (cQ) => cQ.courseId === course.id
                              )}
                              courseId={course.id}
                            />
                            <Button
                              variant={'ghost'}
                              size={'icon'}
                              onClick={() => toggleCourse(course.id)}>
                              <Trash2 />
                              <span className={'sr-only'}>
                                {course.name + ' entfernen'}
                              </span>
                            </Button>
                          </ItemActions>
                        )}
                      </Item>
                    ))}
                  </ItemGroup>
                </ScrollArea>
              ) : (
                <Empty className="flex-1">
                  <EmptyMedia variant={'icon'}>
                    <CircleQuestionMark />
                  </EmptyMedia>
                  <EmptyTitle>
                    {readonlyMode
                      ? 'Keine zugeordneten Vorlesungen'
                      : viewMode === 'all'
                        ? 'Keine Vorlesungen gefunden.'
                        : 'Keine Vorlesungen ausgewählt'}
                  </EmptyTitle>
                  <EmptyDescription>
                    {readonlyMode
                      ? 'Dieser Dozent ist derzeit keiner Vorlesung zugeordnet.'
                      : viewMode === 'all'
                        ? 'Keine Vorlesungen gefunden.'
                        : 'Bitte wählen Sie Vorlesungen aus, die diesem Dozenten zugeordnet werden sollen.'}
                  </EmptyDescription>
                </Empty>
              )}
            </>
          )}
        </div>
        <DialogFooter className="sticky bottom-0 z-10 items-end bg-background pt-2">
          <DialogClose asChild>
            <Button variant="outline">
              {readonly ? 'Schließen' : 'Abbrechen'}
            </Button>
          </DialogClose>
          {!readonlyMode && (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || viewMode == 'all'}>
              Speichern
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
