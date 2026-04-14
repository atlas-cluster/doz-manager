'use client'

import {
  Building2,
  Calendar,
  Clock,
  GraduationCap,
  Plus,
  Timer,
  Trash2,
  XCircle,
} from 'lucide-react'
import {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { toast } from 'sonner'

import { getCourseLecturerAssignments } from '@/features/courses/actions/get-course-lecturer-assignments'
import { getCourseLecturerQualifications } from '@/features/courses/actions/get-course-lecturer-qualifications'
import { Course, CourseQualification } from '@/features/courses/types'
import {
  Lecturer,
  createLecturerCourseAssignment,
  deleteLecturerCourseAssignment,
  getLecturers,
} from '@/features/lecturers'
import { DataTableFacetedFilter } from '@/features/shared/components/data-table-faceted-filter'
import { ExternalUpdateAlert } from '@/features/shared/components/external-update-alert'
import { Avatar, AvatarFallback } from '@/features/shared/components/ui/avatar'
import { Button } from '@/features/shared/components/ui/button'
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
import { Input } from '@/features/shared/components/ui/input'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from '@/features/shared/components/ui/item'
import { ScrollArea } from '@/features/shared/components/ui/scroll-area'
import { Skeleton } from '@/features/shared/components/ui/skeleton'
import { useDebounce } from '@/features/shared/hooks/use-debounce'
import {
  ExperienceOption,
  LeadTimeOption,
} from '@/features/shared/lib/generated/prisma/enums'
import { initialsFromName } from '@/features/shared/lib/utils'

interface LecturerAssignmentDialogProps {
  course: Course
  trigger?: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSubmit?: () => void
  readonly?: boolean
  hasExternalUpdate?: boolean
  onReloadFromServer?: () => Promise<unknown> | unknown
  onEditingChange?: (editing: boolean) => void
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
  hasExternalUpdate = false,
  onReloadFromServer,
  onEditingChange,
}: LecturerAssignmentDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen ?? internalOpen
  const setOpen = setControlledOpen ?? setInternalOpen

  const [loading, setLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [lecturers, setLecturers] = useState<Lecturer[]>([])
  const [assignments, setAssignments] = useState<Lecturer[]>([])
  const [qualifications, setQualifications] = useState<CourseQualification[]>(
    []
  )

  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearchQuery = useDebounce(searchQuery)

  const [experienceFilter, setExperienceFilter] = useState<ExperienceOption[]>(
    []
  )
  const [leadTimeFilter, setLeadTimeFilter] = useState<LeadTimeOption[]>([])

  const loadDialogData = async () => {
    setLoading(true)
    try {
      const [lecturersResponse, assignmentResponse, qualificationResponse] =
        await Promise.all([
          getLecturers({ pageIndex: 0, pageSize: 999999999 }),
          getCourseLecturerAssignments(course.id),
          getCourseLecturerQualifications(course.id),
        ])

      setLecturers(lecturersResponse.data)
      setAssignments(assignmentResponse)
      setQualifications(qualificationResponse)
      setSearchQuery('')
    } catch {
      toast.error('Daten konnten nicht geladen werden')
    } finally {
      setLoading(false)
    }
  }

  const wasEditingRef = useRef(false)

  useEffect(() => {
    if (open && !wasEditingRef.current) {
      onEditingChange?.(true)
      wasEditingRef.current = true
      return
    }

    if (!open && wasEditingRef.current) {
      onEditingChange?.(false)
      wasEditingRef.current = false
    }
  }, [onEditingChange, open])

  useEffect(() => {
    if (!open) return
    void loadDialogData()
  }, [open, course.id])

  const filterLecturer = useCallback(
    (
      lecturer: Lecturer,
      opts: { skipExperience?: boolean; skipLeadTime?: boolean } = {}
    ): boolean => {
      if (debouncedSearchQuery) {
        const fullName = lecturerDisplayName(lecturer).toLowerCase()
        if (!fullName.includes(debouncedSearchQuery.toLowerCase())) return false
      }
      const lq = qualifications.find((q) => q.lecturerId === lecturer.id)
      if (
        !opts.skipExperience &&
        experienceFilter.length > 0 &&
        (!lq || !experienceFilter.includes(lq.experience))
      )
        return false
      if (
        !opts.skipLeadTime &&
        leadTimeFilter.length > 0 &&
        (!lq || !leadTimeFilter.includes(lq.leadTime))
      )
        return false
      return true
    },
    [debouncedSearchQuery, qualifications, experienceFilter, leadTimeFilter]
  )

  const experienceCounts = useMemo(() => {
    const map = new Map<string, number>()
    lecturers.forEach((lecturer) => {
      if (!filterLecturer(lecturer, { skipExperience: true })) return
      const lq = qualifications.find((q) => q.lecturerId === lecturer.id)
      if (lq?.experience) {
        map.set(lq.experience, (map.get(lq.experience) ?? 0) + 1)
      }
    })
    return map
  }, [lecturers, filterLecturer])

  const leadTimeCounts = useMemo(() => {
    const map = new Map<string, number>()
    lecturers.forEach((lecturer) => {
      if (!filterLecturer(lecturer, { skipLeadTime: true })) return
      const lq = qualifications.find((q) => q.lecturerId === lecturer.id)
      if (lq?.leadTime) {
        map.set(lq.leadTime, (map.get(lq.leadTime) ?? 0) + 1)
      }
    })
    return map
  }, [lecturers, filterLecturer])

  const filteredLecturers = useMemo(() => {
    return lecturers.filter((lecturer) => filterLecturer(lecturer))
  }, [lecturers, filterLecturer])

  const toggleAssignment = (lecturer: Lecturer) => {
    const isAssigned = assignments.some((a) => a.id === lecturer.id)
    setAssignments((prev) =>
      isAssigned
        ? prev.filter((a) => a.id !== lecturer.id)
        : [...prev, lecturer]
    )
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    onEditingChange?.(false)
    let shouldRestoreEditingContext = true

    const original = await getCourseLecturerAssignments(course.id)
    const originalIds = original.map((l) => l.id)
    const currentIds = assignments.map((l) => l.id)

    const toAdd = currentIds.filter((id) => !originalIds.includes(id))
    const toRemove = originalIds.filter((id) => !currentIds.includes(id))

    const promise = Promise.all([
      ...toAdd.map((id) => createLecturerCourseAssignment(id, course.id)),
      ...toRemove.map((id) => deleteLecturerCourseAssignment(id, course.id)),
    ])

    try {
      await toast.promise(promise, {
        loading: 'Zuweisungen werden gespeichert...',
        success: 'Zuweisungen gespeichert',
        error: 'Zuweisungen konnten nicht gespeichert werden',
      })
      setOpen(false)
      onSubmit?.()
      shouldRestoreEditingContext = false
    } catch {
      // Toast handles user-facing error feedback.
    } finally {
      setIsSubmitting(false)
      if (shouldRestoreEditingContext) {
        onEditingChange?.(true)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="flex h-[90vh] max-h-[90vh] min-w-[60vw] flex-col overflow-hidden">
        <DialogHeader className="bg-background sticky top-0 pb-2">
          <DialogTitle>Dozenten zuordnen – {course.name}</DialogTitle>
          <DialogDescription>
            Hier können Sie der Vorlesung Dozenten zuweisen.
          </DialogDescription>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-3">
          {hasExternalUpdate && (
            <ExternalUpdateAlert
              onReload={async () => {
                await onReloadFromServer?.()
                await loadDialogData()
              }}
            />
          )}
          <>
            <div className="flex w-full flex-wrap items-center gap-2">
              <Input
                placeholder="Dozenten suchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="md:w-64"
              />

              <DataTableFacetedFilter
                title="Erfahrung"
                options={[
                  { value: 'provadis', label: 'Provadis', icon: Building2 },
                  { value: 'other_uni', label: 'Extern', icon: GraduationCap },
                  { value: 'none', label: 'Keine', icon: XCircle },
                ]}
                value={experienceFilter}
                onChange={(v) => setExperienceFilter(v as ExperienceOption[])}
                facets={experienceCounts}
              />

              <DataTableFacetedFilter
                title="Vorlaufzeit"
                options={[
                  { value: 'short', label: 'Sofort', icon: Timer },
                  { value: 'four_weeks', label: '4 Wochen', icon: Clock },
                  {
                    value: 'more_weeks',
                    label: 'Mehr als 4 Wochen',
                    icon: Calendar,
                  },
                ]}
                value={leadTimeFilter}
                onChange={(v) => setLeadTimeFilter(v as LeadTimeOption[])}
                facets={leadTimeCounts}
              />
            </div>

            <ScrollArea className="min-h-0 flex-1">
              {loading ? (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(20rem,1fr))] gap-3">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Item key={index} variant="outline" size="sm">
                      <ItemMedia>
                        <Skeleton className="h-10 w-10 rounded-full" />
                      </ItemMedia>
                      <ItemContent>
                        <Skeleton className="h-5.25 w-[60%]" />
                        <Skeleton className="h-[19.25px] w-[40%]" />
                      </ItemContent>
                      <ItemActions>
                        <Skeleton className="h-10 w-10 rounded" />
                      </ItemActions>
                    </Item>
                  ))}
                </div>
              ) : filteredLecturers.length === 0 ? (
                <div className="text-muted-foreground col-span-full py-4 text-center">
                  Keine Dozenten gefunden.
                </div>
              ) : (
                <ItemGroup className="grid grid-cols-[repeat(auto-fill,minmax(20rem,1fr))] gap-3">
                  {filteredLecturers
                    .sort((a, b) => {
                      const aAssigned = assignments.some((as) => as.id === a.id)
                      const bAssigned = assignments.some((as) => as.id === b.id)
                      if (aAssigned && !bAssigned) return -1
                      if (!aAssigned && bAssigned) return 1
                      return 0
                    })
                    .map((lecturer) => {
                      const isAssigned = assignments.some(
                        (a) => a.id === lecturer.id
                      )
                      const lq = qualifications.find(
                        (q) => q.lecturerId === lecturer.id
                      )

                      const experienceMap = {
                        provadis: 'Provadis',
                        other_uni: 'Extern',
                        none: 'Keine',
                      }
                      const leadTimeMap = {
                        short: 'Sofort',
                        four_weeks: '4 Wochen',
                        more_weeks: 'Mehr als 4 Wochen',
                      }

                      return (
                        <Item
                          key={lecturer.id}
                          variant="outline"
                          size="sm"
                          className={
                            isAssigned
                              ? 'border-primary bg-sidebar-accent/30'
                              : ''
                          }>
                          <ItemMedia>
                            <Avatar>
                              <AvatarFallback>
                                {initialsFromName(
                                  lecturer.firstName + ' ' + lecturer.lastName
                                )}
                              </AvatarFallback>
                            </Avatar>
                          </ItemMedia>
                          <ItemContent>
                            <ItemTitle>
                              {lecturerDisplayName(lecturer)}
                            </ItemTitle>
                            <ItemDescription>
                              {lq ? (
                                <>
                                  Erfahrung:{' '}
                                  {experienceMap[lq.experience] ??
                                    lq.experience}
                                  <br />
                                  Vorlaufzeit:{' '}
                                  {leadTimeMap[lq.leadTime] ?? lq.leadTime}
                                </>
                              ) : (
                                'Keine Qualifikation hinterlegt'
                              )}
                            </ItemDescription>
                          </ItemContent>
                          <ItemActions>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleAssignment(lecturer)}>
                              {isAssigned ? (
                                <Trash2 className="text-foreground" />
                              ) : (
                                <Plus />
                              )}
                            </Button>
                          </ItemActions>
                        </Item>
                      )
                    })}
                </ItemGroup>
              )}
            </ScrollArea>
          </>
        </div>

        <DialogFooter className="bg-background sticky bottom-0 pt-2">
          <DialogClose asChild>
            <Button variant="outline">Abbrechen</Button>
          </DialogClose>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || hasExternalUpdate}>
            Speichern
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
