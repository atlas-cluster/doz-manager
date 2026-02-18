import {
  ChevronsUpDown,
  CircleQuestionMark,
  PencilRuler,
  Trash2,
} from 'lucide-react'
import { ReactNode, useEffect, useState } from 'react'
import { toast } from 'sonner'

import { createCourseLecturerAssignment } from '@/features/courses/actions/create-course-lecturer-assignment'
import { deleteCourseLecturerAssignment } from '@/features/courses/actions/delete-course-lecturer-assignment'
import { getCourseLecturerAssignments } from '@/features/courses/actions/get-course-lecturer-assignments'
import { Course } from '@/features/courses/types'
import { Lecturer, getLecturers } from '@/features/lecturers'
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

interface LecturerAssignmentProps {
  course: Course
  trigger?: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSubmit?: () => void
  readonly?: boolean
}

function lecturerDisplayName(lecturer: Lecturer): string {
  return [
    lecturer.title,
    lecturer.firstName,
    lecturer.secondName,
    lecturer.lastName,
  ]
    .filter(Boolean)
    .join(' ')
}

export function LecturerAssignmentDialog({
  course,
  trigger,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  onSubmit,
  readonly = false,
}: LecturerAssignmentProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [readonlyMode, setReadonlyMode] = useState(readonly)

  const [lecturers, setLecturers] = useState<Lecturer[]>([])
  const [selectedLecturers, setSelectedLecturers] = useState<Lecturer[]>([])

  const open = controlledOpen ?? internalOpen
  const setOpen = setControlledOpen ?? setInternalOpen

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [lecturersResponse, assignmentsResponse] = await Promise.all([
          getLecturers({ pageIndex: 0, pageSize: 999999999 }),
          getCourseLecturerAssignments(course.id),
        ])
        setLecturers(lecturersResponse.data)
        setSelectedLecturers(assignmentsResponse)
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
  }, [course.id, open, readonly])

  const toggleLecturer = (lecturerId: string) => {
    if (selectedLecturers.some((l) => l.id === lecturerId)) {
      setSelectedLecturers(selectedLecturers.filter((l) => l.id !== lecturerId))
    } else {
      const lecturer = lecturers.find((l) => l.id === lecturerId)
      if (lecturer) {
        setSelectedLecturers([...selectedLecturers, lecturer])
      }
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    const currentLecturerIds = selectedLecturers.map((l) => l.id)
    const originalLecturerIds = (
      await getCourseLecturerAssignments(course.id)
    ).map((l) => l.id)

    const lecturersToAdd = currentLecturerIds.filter(
      (id) => !originalLecturerIds.includes(id)
    )
    const lecturersToRemove = originalLecturerIds.filter(
      (id) => !currentLecturerIds.includes(id)
    )

    const promise = Promise.all([
      ...lecturersToAdd.map((lecturerId) =>
        createCourseLecturerAssignment(course.id, lecturerId)
      ),
      ...lecturersToRemove.map((lecturerId) =>
        deleteCourseLecturerAssignment(course.id, lecturerId)
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
    }
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
            {readonlyMode ? 'Dozenten ansehen - ' : 'Dozenten zuordnen - '}
            {course.name}
          </DialogTitle>
          <DialogDescription>
            {readonlyMode
              ? 'Die folgenden Dozenten sind dieser Vorlesung zugeordnet'
              : 'Weisen Sie dieser Vorlesung Dozenten zu'}
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
                <Popover modal>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      suppressHydrationWarning
                      className="w-fit">
                      {selectedLecturers.length >= 1
                        ? `${selectedLecturers.length} Dozent${selectedLecturers.length != 1 ? 'en' : ''} ausgewählt`
                        : 'Dozenten auswählen...'}
                      <ChevronsUpDown />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Suche Dozenten..." />
                      <CommandList>
                        <CommandEmpty>Keine Dozenten gefunden.</CommandEmpty>
                        <CommandGroup>
                          {lecturers.map((lecturer) => (
                            <CommandItem
                              key={lecturer.id}
                              onSelect={() => toggleLecturer(lecturer.id)}
                              value={lecturer.id}>
                              <Checkbox
                                checked={selectedLecturers.some(
                                  (l) => l.id === lecturer.id
                                )}
                                className="pointer-events-none"
                              />
                              {lecturerDisplayName(lecturer)}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              )}
              {selectedLecturers.length > 0 ? (
                <ScrollArea className="min-h-0 flex-1">
                  <ItemGroup className="grid grid-cols-[repeat(auto-fill,minmax(20rem,1fr))] gap-3">
                    {selectedLecturers.map((lecturer) => (
                      <Item
                        key={lecturer.id}
                        variant="outline"
                        size={'sm'}
                        className={'flex flex-nowrap'}>
                        <ItemMedia>
                          <Avatar className={'size-10'}>
                            <AvatarFallback>
                              {initialsFromName(
                                lecturer.firstName + ' ' + lecturer.lastName
                              )}
                            </AvatarFallback>
                          </Avatar>
                        </ItemMedia>
                        <ItemContent>
                          <ItemTitle>{lecturerDisplayName(lecturer)}</ItemTitle>
                          <ItemDescription>
                            {lecturer.type === 'internal' ? 'Intern' : 'Extern'}{' '}
                            | {lecturer.email}
                          </ItemDescription>
                        </ItemContent>
                        {!readonlyMode && (
                          <ItemActions>
                            <Button
                              variant={'ghost'}
                              size={'icon'}
                              onClick={() => toggleLecturer(lecturer.id)}>
                              <Trash2 />
                              <span className={'sr-only'}>
                                {lecturerDisplayName(lecturer) + ' entfernen'}
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
                      ? 'Keine zugeordneten Dozenten'
                      : 'Keine Dozenten ausgewählt'}
                  </EmptyTitle>
                  <EmptyDescription>
                    {readonlyMode
                      ? 'Diese Vorlesung ist derzeit keinem Dozenten zugeordnet.'
                      : 'Bitte wählen Sie Dozenten aus, die dieser Vorlesung zugeordnet werden sollen.'}
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
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              Speichern
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
