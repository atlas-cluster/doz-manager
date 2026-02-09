import {
  ChevronsUpDown,
  CircleQuestionMark,
  PencilRuler,
  Trash2,
} from 'lucide-react'
import { ReactNode, useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Course, getCourses } from '@/features/courses'
import { Lecturer } from '@/features/lecturers'
import { createLecturerCourseAssignment } from '@/features/lecturers/actions/create-lecturer-course-assignment'
import { deleteLecturerCourseAssignment } from '@/features/lecturers/actions/delete-lecturer-course-assignment'
import { getLecturerCourseAssignments } from '@/features/lecturers/actions/get-lecturer-course-assignments'
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

  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourses, setSelectedCourses] = useState<Course[]>([])

  const open = controlledOpen ?? internalOpen
  const setOpen = setControlledOpen ?? setInternalOpen

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [coursesResponse, assignmentsResponse] = await Promise.all([
          getCourses({ pageIndex: 0, pageSize: 999999999 }),
          getLecturerCourseAssignments(lecturer.id),
        ])
        setCourses(coursesResponse.data)
        setSelectedCourses(assignmentsResponse)
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
      ...coursesToRemove.map((courseId) =>
        deleteLecturerCourseAssignment(lecturer.id, courseId)
      ),
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent
        className={'min-h-[90vh] max-h-[90vh] overflow-y-auto min-w-[60vw]'}>
        <DialogHeader>
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
        <div className={'flex flex-col gap-3'}>
          {loading ? (
            <>
              <Skeleton className="h-9 w-48" />
              <ScrollArea className={'max-h-[65vh] h-[50vh] overflow-y-auto'}>
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
                <Popover modal>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      suppressHydrationWarning
                      className="w-fit">
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
                        <CommandEmpty>Keine Vorlesungen gefunden.</CommandEmpty>
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
              )}
              {selectedCourses.length > 0 ? (
                <ScrollArea className={'max-h-[65vh] h-[50vh] overflow-y-auto'}>
                  <ItemGroup className="grid grid-cols-[repeat(auto-fill,minmax(20rem,1fr))] gap-3">
                    {selectedCourses.map((course) => (
                      <Item
                        key={course.id}
                        variant="outline"
                        size={'sm'}
                        className={'flex flex-nowrap'}>
                        <ItemMedia>
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
                            | {course.semester}. Semester
                          </ItemDescription>
                        </ItemContent>
                        {!readonlyMode && (
                          <ItemActions>
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
                <Empty className={'min-h-[65vh]'}>
                  <EmptyMedia variant={'icon'}>
                    <CircleQuestionMark />
                  </EmptyMedia>
                  <EmptyTitle>
                    {readonlyMode
                      ? 'Keine zugeordneten Vorlesungen'
                      : 'Keine Vorlesungen ausgewählt'}
                  </EmptyTitle>
                  <EmptyDescription>
                    {readonlyMode
                      ? 'Dieser Dozent ist derzeit keiner Vorlesung zugeordnet.'
                      : 'Bitte wählen Sie Vorlesungen aus, die diesem Dozenten zugeordnet werden sollen.'}
                  </EmptyDescription>
                </Empty>
              )}
            </>
          )}
        </div>
        <DialogFooter className={'items-end'}>
          <DialogClose asChild>
            <Button variant="outline">
              {readonly ? 'Schließen' : 'Abbrechen'}
            </Button>
          </DialogClose>
          {!readonlyMode && (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              Speichern
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
