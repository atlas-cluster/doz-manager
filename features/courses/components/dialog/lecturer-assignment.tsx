'use client'

import {
  Blend,
  BookOpen,
  Calendar,
  CheckCircle2,
  CircleQuestionMark,
  Clock,
  GraduationCap,
  Pencil,
  Plus,
  Timer,
  Trash2,
  XCircle,
  XIcon,
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

import { getCourseAssignmentsForCourse } from '@/features/courses/actions/get-course-assignments-for-course'
import { Course, CourseAssignment } from '@/features/courses/types'
import { Lecturer, getLecturers } from '@/features/lecturers'
import { deleteCourseAssignment } from '@/features/shared/actions/delete-course-assignment'
import { upsertCourseAssignment } from '@/features/shared/actions/upsert-course-assignment'
import { DataTableFacetedFilter } from '@/features/shared/components/data-table-faceted-filter'
import {
  CourseAssignmentDetails,
  EditCourseAssignmentDialog,
} from '@/features/shared/components/edit-course-assignment'
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
import {
  Empty,
  EmptyDescription,
  EmptyMedia,
  EmptyTitle,
} from '@/features/shared/components/ui/empty'
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
  CourseLevelPreference,
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

type EditableAssignment = {
  lecturerId: string
  isAssigned: boolean
  experience: ExperienceOption | null
  leadTime: LeadTimeOption | null
  courseLevelPreference: 'bachelor' | 'master' | null
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

function fromCourseAssignment(a: CourseAssignment): EditableAssignment {
  return {
    lecturerId: a.lecturerId,
    isAssigned: a.isAssigned,
    experience: a.experience ?? null,
    leadTime: a.leadTime ?? null,
    courseLevelPreference:
      a.courseLevelPreference === 'bachelor' ||
      a.courseLevelPreference === 'master'
        ? a.courseLevelPreference
        : null,
  }
}

function isEmptyRow(row: EditableAssignment): boolean {
  return (
    !row.isAssigned &&
    row.experience === null &&
    row.leadTime === null &&
    row.courseLevelPreference === null
  )
}

function rowsEqual(a: EditableAssignment, b: EditableAssignment): boolean {
  return (
    a.isAssigned === b.isAssigned &&
    a.experience === b.experience &&
    a.leadTime === b.leadTime &&
    a.courseLevelPreference === b.courseLevelPreference
  )
}

const experienceLabel: Record<ExperienceOption, string> = {
  provadis: 'Provadis',
  other_uni: 'Extern',
  none: 'Keine',
}
const leadTimeLabel: Record<LeadTimeOption, string> = {
  short: 'Sofort',
  four_weeks: '4 Wochen',
  more_weeks: 'Mehr als 4 Wochen',
}
const preferenceLabel: Record<CourseLevelPreference, string> = {
  bachelor: 'Bachelor',
  master: 'Master',
  both: 'Beides',
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
  const [originalAssignments, setOriginalAssignments] = useState<
    EditableAssignment[]
  >([])
  const [editedAssignments, setEditedAssignments] = useState<
    EditableAssignment[]
  >([])

  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearchQuery = useDebounce(searchQuery)

  const [preferenceFilter, setPreferenceFilter] = useState<
    CourseLevelPreference[]
  >([])
  const [experienceFilter, setExperienceFilter] = useState<ExperienceOption[]>(
    []
  )
  const [leadTimeFilter, setLeadTimeFilter] = useState<LeadTimeOption[]>([])

  const loadDialogData = async () => {
    setLoading(true)
    try {
      const [lecturersResponse, assignmentsResponse] = await Promise.all([
        getLecturers({ pageIndex: 0, pageSize: 999999999 }),
        getCourseAssignmentsForCourse(course.id),
      ])
      setLecturers(lecturersResponse.data)
      const rows = assignmentsResponse.map(fromCourseAssignment)
      setOriginalAssignments(rows)
      setEditedAssignments(rows)
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
    // Pre-select lecturers whose preference matches this course level, plus
    // those without a specific preference ("both").
    setPreferenceFilter(
      course.courseLevel === 'bachelor'
        ? ['bachelor', 'both']
        : ['master', 'both']
    )
  }, [open, course.id, course.courseLevel])

  const getRow = useCallback(
    (lecturerId: string): EditableAssignment | undefined =>
      editedAssignments.find((r) => r.lecturerId === lecturerId),
    [editedAssignments]
  )

  const filterLecturer = useCallback(
    (
      lecturer: Lecturer,
      opts: {
        skipPreference?: boolean
        skipExperience?: boolean
        skipLeadTime?: boolean
      } = {}
    ): boolean => {
      if (debouncedSearchQuery) {
        const fullName = lecturerDisplayName(lecturer).toLowerCase()
        if (!fullName.includes(debouncedSearchQuery.toLowerCase())) return false
      }
      const row = getRow(lecturer.id)
      if (
        !opts.skipPreference &&
        preferenceFilter.length > 0 &&
        !preferenceFilter.includes(lecturer.courseLevelPreference)
      )
        return false
      if (!opts.skipExperience && experienceFilter.length > 0) {
        if (!row?.experience || !experienceFilter.includes(row.experience))
          return false
      }
      if (!opts.skipLeadTime && leadTimeFilter.length > 0) {
        if (!row?.leadTime || !leadTimeFilter.includes(row.leadTime))
          return false
      }
      return true
    },
    [
      debouncedSearchQuery,
      getRow,
      preferenceFilter,
      experienceFilter,
      leadTimeFilter,
    ]
  )

  const preferenceCounts = useMemo(() => {
    const map = new Map<string, number>()
    lecturers.forEach((lecturer) => {
      if (!filterLecturer(lecturer, { skipPreference: true })) return
      map.set(
        lecturer.courseLevelPreference,
        (map.get(lecturer.courseLevelPreference) ?? 0) + 1
      )
    })
    return map
  }, [lecturers, filterLecturer])

  const experienceCounts = useMemo(() => {
    const map = new Map<string, number>()
    lecturers.forEach((lecturer) => {
      if (!filterLecturer(lecturer, { skipExperience: true })) return
      const row = getRow(lecturer.id)
      if (row?.experience)
        map.set(row.experience, (map.get(row.experience) ?? 0) + 1)
    })
    return map
  }, [lecturers, filterLecturer, getRow])

  const leadTimeCounts = useMemo(() => {
    const map = new Map<string, number>()
    lecturers.forEach((lecturer) => {
      if (!filterLecturer(lecturer, { skipLeadTime: true })) return
      const row = getRow(lecturer.id)
      if (row?.leadTime) map.set(row.leadTime, (map.get(row.leadTime) ?? 0) + 1)
    })
    return map
  }, [lecturers, filterLecturer, getRow])

  const filteredLecturers = useMemo(
    () => lecturers.filter((l) => filterLecturer(l)),
    [lecturers, filterLecturer]
  )

  const setRow = (
    lecturerId: string,
    patch: Partial<Omit<EditableAssignment, 'lecturerId'>>
  ) => {
    setEditedAssignments((prev) => {
      const existing = prev.find((r) => r.lecturerId === lecturerId)
      if (existing) {
        return prev.map((r) =>
          r.lecturerId === lecturerId ? { ...r, ...patch } : r
        )
      }
      return [
        ...prev,
        {
          lecturerId,
          isAssigned: false,
          experience: null,
          leadTime: null,
          courseLevelPreference: null,
          ...patch,
        },
      ]
    })
  }

  const toggleAssigned = (lecturerId: string) => {
    const row = getRow(lecturerId)
    setRow(lecturerId, { isAssigned: !row?.isAssigned })
  }

  const applyDetails = (
    lecturerId: string,
    details: CourseAssignmentDetails
  ) => {
    setRow(lecturerId, {
      experience: details.experience,
      leadTime: details.leadTime,
      courseLevelPreference: details.courseLevelPreference,
    })
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    onEditingChange?.(false)
    let shouldRestoreEditingContext = true

    const ops: Promise<unknown>[] = []

    for (const edited of editedAssignments) {
      const original = originalAssignments.find(
        (o) => o.lecturerId === edited.lecturerId
      )
      if (original && rowsEqual(original, edited)) continue

      if (isEmptyRow(edited)) {
        if (original)
          ops.push(deleteCourseAssignment(edited.lecturerId, course.id))
        continue
      }

      ops.push(
        upsertCourseAssignment(edited.lecturerId, course.id, {
          isAssigned: edited.isAssigned,
          experience: edited.experience,
          leadTime: edited.leadTime,
          courseLevelPreference: edited.courseLevelPreference,
        })
      )
    }

    for (const original of originalAssignments) {
      if (
        !editedAssignments.find((e) => e.lecturerId === original.lecturerId)
      ) {
        ops.push(deleteCourseAssignment(original.lecturerId, course.id))
      }
    }

    try {
      await toast.promise(Promise.all(ops), {
        loading: 'Zuordnungen werden gespeichert...',
        success: 'Zuordnungen gespeichert',
        error: 'Zuordnungen konnten nicht gespeichert werden',
      })
      setOpen(false)
      onSubmit?.()
      shouldRestoreEditingContext = false
    } catch {
      // Toast handles user-facing error feedback.
    } finally {
      setIsSubmitting(false)
      if (shouldRestoreEditingContext) onEditingChange?.(true)
    }
  }

  const hasActiveFilters =
    preferenceFilter.length > 0 ||
    experienceFilter.length > 0 ||
    leadTimeFilter.length > 0 ||
    debouncedSearchQuery !== ''

  const clearAllFilters = () => {
    setPreferenceFilter([])
    setExperienceFilter([])
    setLeadTimeFilter([])
    setSearchQuery('')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="flex h-[90vh] max-h-[90vh] min-w-[60vw] flex-col overflow-hidden">
        <DialogHeader className="bg-background sticky top-0 pb-2">
          <DialogTitle>Dozenten verwalten – {course.name}</DialogTitle>
          <DialogDescription>
            Verwalten Sie Zuordnungen und Qualifikationen der Dozenten für diese
            Vorlesung.
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
          <div className="flex w-full flex-wrap items-center gap-2">
            <Input
              placeholder="Dozenten suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="md:w-64"
            />
            <DataTableFacetedFilter
              title="Präferenz"
              options={[
                { value: 'bachelor', label: 'Bachelor', icon: BookOpen },
                { value: 'master', label: 'Master', icon: GraduationCap },
                { value: 'both', label: 'Beides', icon: Blend },
              ]}
              value={preferenceFilter}
              onChange={(v) =>
                setPreferenceFilter(v as CourseLevelPreference[])
              }
              facets={preferenceCounts}
            />
            <DataTableFacetedFilter
              title="Erfahrung"
              options={[
                { value: 'provadis', label: 'Provadis', icon: GraduationCap },
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
            {hasActiveFilters && (
              <Button variant="ghost" size="icon" onClick={clearAllFilters}>
                <XIcon />
                <span className="sr-only">Filter löschen</span>
              </Button>
            )}
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
              <Empty className="flex-1">
                <EmptyMedia variant={'icon'}>
                  <CircleQuestionMark />
                </EmptyMedia>
                <EmptyTitle>Keine Dozenten gefunden</EmptyTitle>
                <EmptyDescription>
                  Bitte passen Sie Suche oder Filter an.
                </EmptyDescription>
              </Empty>
            ) : (
              <ItemGroup className="grid grid-cols-[repeat(auto-fill,minmax(20rem,1fr))] gap-3">
                {filteredLecturers
                  .slice()
                  .sort((a, b) => {
                    const aRow = getRow(a.id)
                    const bRow = getRow(b.id)
                    const aActive = !!aRow?.isAssigned
                    const bActive = !!bRow?.isAssigned
                    if (aActive && !bActive) return -1
                    if (!aActive && bActive) return 1
                    return 0
                  })
                  .map((lecturer) => {
                    const row = getRow(lecturer.id)
                    const isAssigned = !!row?.isAssigned
                    const hasQualification = !!(
                      row?.experience || row?.leadTime
                    )
                    const showPerRowLevelPref =
                      lecturer.courseLevelPreference === 'both'

                    return (
                      <Item
                        key={lecturer.id}
                        variant="outline"
                        size="sm"
                        className={
                          isAssigned
                            ? 'border-primary bg-sidebar-accent/30 flex flex-nowrap'
                            : 'flex flex-nowrap'
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
                          <ItemTitle>{lecturerDisplayName(lecturer)}</ItemTitle>
                          <ItemDescription className="line-clamp-none">
                            Präferenz:{' '}
                            {
                              preferenceLabel[
                                row?.courseLevelPreference ??
                                  lecturer.courseLevelPreference
                              ]
                            }
                            <br />
                            {row?.experience || row?.leadTime ? (
                              <>
                                {row?.experience &&
                                  experienceLabel[row.experience]}
                                {row?.experience && row?.leadTime && ' | '}
                                {row?.leadTime && leadTimeLabel[row.leadTime]}
                              </>
                            ) : (
                              'Keine Qualifikation hinterlegt'
                            )}
                          </ItemDescription>
                        </ItemContent>
                        <ItemActions>
                          <EditCourseAssignmentDialog
                            trigger={
                              <Button variant="ghost" size="icon">
                                <Pencil />
                                <span className="sr-only">
                                  {lecturerDisplayName(lecturer) +
                                    (hasQualification
                                      ? ' bearbeiten'
                                      : ' qualifizieren')}
                                </span>
                              </Button>
                            }
                            showCourseLevelPreference={showPerRowLevelPref}
                            initial={{
                              experience: row?.experience ?? null,
                              leadTime: row?.leadTime ?? null,
                              courseLevelPreference:
                                row?.courseLevelPreference ?? null,
                            }}
                            onSubmit={(d) => applyDetails(lecturer.id, d)}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleAssigned(lecturer.id)}>
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
