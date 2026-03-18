'use client'

import {
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  GraduationCap,
  Plus,
  Timer,
  Trash2,
  XCircle,
} from 'lucide-react'
import { ReactNode, useEffect, useMemo, useState } from 'react'
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

  useEffect(() => {
    if (!open) return
    const fetchData = async () => {
      try {
        setLoading(true)
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
    fetchData()
  }, [open, course.id])

  const experienceCounts = useMemo(() => {
    const map = new Map<string, number>()
    qualifications.forEach((q) =>
      map.set(q.experience, (map.get(q.experience) ?? 0) + 1)
    )
    return map
  }, [qualifications])

  const leadTimeCounts = useMemo(() => {
    const map = new Map<string, number>()
    qualifications.forEach((q) =>
      map.set(q.leadTime, (map.get(q.leadTime) ?? 0) + 1)
    )
    return map
  }, [qualifications])

  const filteredLecturers = useMemo(() => {
    return lecturers.filter((lecturer) => {
      const fullName = lecturerDisplayName(lecturer).toLowerCase()
      if (
        debouncedSearchQuery &&
        !fullName.includes(debouncedSearchQuery.toLowerCase())
      )
        return false

      const lq = qualifications.find((q) => q.lecturerId === lecturer.id)
      const hasQ = !!lq

      if (
        experienceFilter.length > 0 &&
        (!lq || !experienceFilter.includes(lq.experience))
      )
        return false

      if (
        leadTimeFilter.length > 0 &&
        (!lq || !leadTimeFilter.includes(lq.leadTime))
      )
        return false

      return true
    })
  }, [
    lecturers,
    qualifications,
    debouncedSearchQuery,
    experienceFilter,
    leadTimeFilter,
  ])

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

    const original = await getCourseLecturerAssignments(course.id)
    const originalIds = original.map((l) => l.id)
    const currentIds = assignments.map((l) => l.id)

    const toAdd = currentIds.filter((id) => !originalIds.includes(id))
    const toRemove = originalIds.filter((id) => !currentIds.includes(id))

    const promise = Promise.all([
      ...toAdd.map((id) => createLecturerCourseAssignment(id, course.id)),
      ...toRemove.map((id) => deleteLecturerCourseAssignment(id, course.id)),
    ])

    toast.promise(promise, {
      loading: 'Zuweisungen werden gespeichert...',
      success: () => {
        setIsSubmitting(false)
        setOpen(false)
        onSubmit?.()
        return 'Zuweisungen gespeichert'
      },
      error: () => {
        setIsSubmitting(false)
        return 'Zuweisungen konnten nicht gespeichert werden'
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="flex h-[90vh] max-h-[90vh] min-w-[60vw] flex-col overflow-hidden">
        <DialogHeader className="sticky top-0 bg-background pb-2">
          <DialogTitle>Dozenten zuordnen – {course.name}</DialogTitle>
          <DialogDescription>
            Hier können Sie der Vorlesung Dozenten zuweisen.
          </DialogDescription>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-3">
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
                <div className="col-span-full text-center text-muted-foreground py-4">
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
                        <Item key={lecturer.id} variant="outline" size="sm">
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
                            <ItemTitle
                              className={isAssigned ? 'text-blue-900' : ''}>
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

        <DialogFooter className="sticky bottom-0 bg-background pt-2">
          <DialogClose asChild>
            <Button variant="outline">Abbrechen</Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            Speichern
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
