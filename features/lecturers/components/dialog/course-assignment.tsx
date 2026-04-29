import {
  BookOpen,
  Calendar,
  CheckCircle2,
  CircleQuestionMark,
  Clock,
  GraduationCap,
  Pencil,
  PencilRuler,
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

import { Course, CourseAssignment, getCourses } from '@/features/courses'
import { Lecturer } from '@/features/lecturers'
import { getCourseAssignmentsForLecturer } from '@/features/lecturers/actions/get-course-assignments-for-lecturer'
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
import { useLiveChanges } from '@/features/shared/hooks/use-live-changes'
import {
  ExperienceOption,
  LeadTimeOption,
} from '@/features/shared/lib/generated/prisma/enums'
import { initialsFromName } from '@/features/shared/lib/utils'

interface CourseAssignmentProps {
  lecturer: Lecturer
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
  courseId: string
  isAssigned: boolean
  experience: ExperienceOption | null
  leadTime: LeadTimeOption | null
  courseLevelPreference: 'bachelor' | 'master' | null
}

function fromCourseAssignment(a: CourseAssignment): EditableAssignment {
  return {
    courseId: a.courseId,
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

export function CourseAssignmentDialog({
  lecturer,
  trigger,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  onSubmit,
  readonly = false,
  hasExternalUpdate = false,
  onReloadFromServer,
  onEditingChange,
}: CourseAssignmentProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [readonlyMode, setReadonlyMode] = useState(readonly)

  const [courses, setCourses] = useState<Course[]>([])
  const [originalAssignments, setOriginalAssignments] = useState<
    EditableAssignment[]
  >([])
  const [editedAssignments, setEditedAssignments] = useState<
    EditableAssignment[]
  >([])

  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearchQuery = useDebounce(searchQuery)
  const [courseLevelFilter, setCourseLevelFilter] = useState<
    Array<'bachelor' | 'master'>
  >([])
  const [semesterFilter, setSemesterFilter] = useState<string[]>([])
  const [experienceFilter, setExperienceFilter] = useState<ExperienceOption[]>(
    []
  )
  const [leadTimeFilter, setLeadTimeFilter] = useState<LeadTimeOption[]>([])

  const open = controlledOpen ?? internalOpen
  const setOpen = setControlledOpen ?? setInternalOpen

  const showPerRowLevelPref = lecturer.courseLevelPreference === 'both'

  const loadDialogData = async () => {
    setLoading(true)
    try {
      const [coursesResponse, assignmentsResponse] = await Promise.all([
        getCourses({ pageIndex: 0, pageSize: 999999999 }),
        getCourseAssignmentsForLecturer(lecturer.id),
      ])
      setCourses(coursesResponse.data)
      const rows = assignmentsResponse.map(fromCourseAssignment)
      setOriginalAssignments(rows)
      setEditedAssignments(rows)
      setSearchQuery('')
    } catch (error) {
      console.error('Failed to fetch data', error)
      toast.error('Daten konnten nicht geladen werden')
    } finally {
      setLoading(false)
    }
  }

  const wasEditingRef = useRef(false)

  useEffect(() => {
    const isEditingSession = open && !readonlyMode

    if (isEditingSession && !wasEditingRef.current) {
      onEditingChange?.(true)
      wasEditingRef.current = true
      return
    }

    if (!isEditingSession && wasEditingRef.current) {
      onEditingChange?.(false)
      wasEditingRef.current = false
    }
  }, [onEditingChange, open, readonlyMode])

  useEffect(() => {
    if (open) {
      void loadDialogData()
      setReadonlyMode(readonly)
      setHasLocalExternalUpdate(false)
      // Pre-select the lecturer's level preference (bachelor / master only;
      // for "both" we leave the filter empty so all courses are visible).
      setCourseLevelFilter(
        lecturer.courseLevelPreference === 'bachelor' ||
          lecturer.courseLevelPreference === 'master'
          ? [lecturer.courseLevelPreference]
          : []
      )
    }
  }, [lecturer.id, lecturer.courseLevelPreference, open, readonly])

  const [hasLocalExternalUpdate, setHasLocalExternalUpdate] = useState(false)

  useLiveChanges({
    tags: open ? ['lecturers', 'courses'] : [],
    onChangeAction: (event) => {
      if (!open) return
      const isRelevant =
        !event.entities?.length ||
        event.entities.some(
          (e) =>
            (e.entityType === 'lecturer' && e.entityId === lecturer.id) ||
            e.entityType === 'course'
        )
      if (!isRelevant) return
      if (readonlyMode) {
        void loadDialogData()
      } else {
        setHasLocalExternalUpdate(true)
      }
    },
  })

  const effectiveHasExternalUpdate = hasExternalUpdate || hasLocalExternalUpdate

  const getRow = useCallback(
    (courseId: string): EditableAssignment | undefined =>
      editedAssignments.find((r) => r.courseId === courseId),
    [editedAssignments]
  )

  const filterCourse = useCallback(
    (
      course: Course,
      opts: {
        skipCourseLevel?: boolean
        skipSemester?: boolean
        skipExperience?: boolean
        skipLeadTime?: boolean
      } = {}
    ): boolean => {
      if (debouncedSearchQuery) {
        if (
          !course.name
            .toLowerCase()
            .includes(debouncedSearchQuery.toLowerCase())
        )
          return false
      }

      if (
        !opts.skipCourseLevel &&
        courseLevelFilter.length > 0 &&
        !courseLevelFilter.includes(course.courseLevel)
      )
        return false

      if (
        !opts.skipSemester &&
        semesterFilter.length > 0 &&
        !semesterFilter.includes(String(course.semester))
      )
        return false

      const row = getRow(course.id)

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
      courseLevelFilter,
      semesterFilter,
      getRow,
      experienceFilter,
      leadTimeFilter,
    ]
  )

  const courseLevelCounts = useMemo(() => {
    const map = new Map<string, number>()
    courses.forEach((course) => {
      if (!filterCourse(course, { skipCourseLevel: true })) return
      map.set(course.courseLevel, (map.get(course.courseLevel) ?? 0) + 1)
    })
    return map
  }, [courses, filterCourse])

  const semesterCounts = useMemo(() => {
    const map = new Map<string, number>()
    courses.forEach((course) => {
      if (!filterCourse(course, { skipSemester: true })) return
      const s = String(course.semester)
      map.set(s, (map.get(s) ?? 0) + 1)
    })
    return map
  }, [courses, filterCourse])

  const experienceCounts = useMemo(() => {
    const map = new Map<string, number>()
    courses.forEach((course) => {
      if (!filterCourse(course, { skipExperience: true })) return
      const row = getRow(course.id)
      if (row?.experience)
        map.set(row.experience, (map.get(row.experience) ?? 0) + 1)
    })
    return map
  }, [courses, filterCourse, getRow])

  const leadTimeCounts = useMemo(() => {
    const map = new Map<string, number>()
    courses.forEach((course) => {
      if (!filterCourse(course, { skipLeadTime: true })) return
      const row = getRow(course.id)
      if (row?.leadTime) map.set(row.leadTime, (map.get(row.leadTime) ?? 0) + 1)
    })
    return map
  }, [courses, filterCourse, getRow])

  const filteredCourses = useMemo(
    () => courses.filter((c) => filterCourse(c)),
    [courses, filterCourse]
  )

  const setRow = (
    courseId: string,
    patch: Partial<Omit<EditableAssignment, 'courseId'>>
  ) => {
    setEditedAssignments((prev) => {
      const existing = prev.find((r) => r.courseId === courseId)
      if (existing) {
        return prev.map((r) =>
          r.courseId === courseId ? { ...r, ...patch } : r
        )
      }
      return [
        ...prev,
        {
          courseId,
          isAssigned: false,
          experience: null,
          leadTime: null,
          courseLevelPreference: null,
          ...patch,
        },
      ]
    })
  }

  const toggleAssigned = (courseId: string) => {
    const row = getRow(courseId)
    setRow(courseId, { isAssigned: !row?.isAssigned })
  }

  const applyDetails = (courseId: string, details: CourseAssignmentDetails) => {
    setRow(courseId, {
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
        (o) => o.courseId === edited.courseId
      )
      if (original && rowsEqual(original, edited)) continue

      if (isEmptyRow(edited)) {
        if (original)
          ops.push(deleteCourseAssignment(lecturer.id, edited.courseId))
        continue
      }

      ops.push(
        upsertCourseAssignment(lecturer.id, edited.courseId, {
          isAssigned: edited.isAssigned,
          experience: edited.experience,
          leadTime: edited.leadTime,
          courseLevelPreference: edited.courseLevelPreference,
        })
      )
    }

    for (const original of originalAssignments) {
      if (!editedAssignments.find((e) => e.courseId === original.courseId)) {
        ops.push(deleteCourseAssignment(lecturer.id, original.courseId))
      }
    }

    try {
      await toast.promise(Promise.all(ops), {
        loading: 'Zuordnungen werden gespeichert...',
        success: 'Zuordnungen gespeichert',
        error: 'Zuordnungen konnten nicht gespeichert werden',
      })
      onSubmit?.()
      setOpen(false)
      shouldRestoreEditingContext = false
    } catch (error) {
      console.error('Failed to save assignments', error)
    } finally {
      setIsSubmitting(false)
      if (shouldRestoreEditingContext) onEditingChange?.(true)
    }
  }

  const hasActiveFilters =
    courseLevelFilter.length > 0 ||
    semesterFilter.length > 0 ||
    experienceFilter.length > 0 ||
    leadTimeFilter.length > 0 ||
    debouncedSearchQuery !== ''

  const clearAllFilters = () => {
    setCourseLevelFilter([])
    setSemesterFilter([])
    setExperienceFilter([])
    setLeadTimeFilter([])
    setSearchQuery('')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && (
        <DialogTrigger asChild suppressHydrationWarning>
          {trigger}
        </DialogTrigger>
      )}
      <DialogContent
        className={
          'flex h-[90vh] max-h-[90vh] min-w-[60vw] flex-col overflow-hidden'
        }>
        <DialogHeader className="bg-background sticky top-0 z-10 pb-2">
          <DialogTitle>
            {readonlyMode
              ? 'Vorlesungen ansehen - '
              : 'Vorlesungen verwalten - '}
            {lecturer.title ? lecturer.title + ' ' : ''}
            {lecturer.firstName}
            {lecturer.secondName ? ' ' + lecturer.secondName : ''}
            {' ' + lecturer.lastName}
          </DialogTitle>
          <DialogDescription>
            {readonlyMode
              ? 'Die folgenden Vorlesungen sind diesem Dozenten zugeordnet bzw. qualifiziert'
              : 'Verwalten Sie Zuordnungen und Qualifikationen für diesen Dozenten'}
          </DialogDescription>
        </DialogHeader>
        <div className={'flex min-h-0 flex-1 flex-col gap-3'}>
          {effectiveHasExternalUpdate && !readonlyMode && (
            <ExternalUpdateAlert
              onReload={async () => {
                setHasLocalExternalUpdate(false)
                await onReloadFromServer?.()
                await loadDialogData()
              }}
            />
          )}
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
                  onClick={() => {
                    setReadonlyMode(false)
                    setHasLocalExternalUpdate(false)
                  }}
                  variant={'outline'}
                  className="w-fit">
                  <PencilRuler />
                  In Bearbeitungsmodus wechseln
                </Button>
              )}
              {!readonlyMode && (
                <div className="flex w-full flex-wrap items-center gap-2">
                  <Input
                    placeholder="Vorlesungen suchen..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="md:w-64"
                  />
                  <DataTableFacetedFilter
                    title="Vorlesungsstufe"
                    options={[
                      {
                        value: 'bachelor',
                        label: 'Bachelor',
                        icon: GraduationCap,
                      },
                      { value: 'master', label: 'Master', icon: BookOpen },
                    ]}
                    value={courseLevelFilter}
                    onChange={(v) =>
                      setCourseLevelFilter(v as Array<'bachelor' | 'master'>)
                    }
                    facets={courseLevelCounts}
                  />
                  <DataTableFacetedFilter
                    title="Semester"
                    options={Array.from({ length: 6 }).map((_, index) => ({
                      value: String(index + 1),
                      label: `${index + 1}. Semester`,
                      icon: Calendar,
                    }))}
                    value={semesterFilter}
                    onChange={(v) => setSemesterFilter(v)}
                    facets={semesterCounts}
                  />
                  <DataTableFacetedFilter
                    title="Erfahrung"
                    options={[
                      {
                        value: 'provadis',
                        label: 'Provadis',
                        icon: GraduationCap,
                      },
                      {
                        value: 'other_uni',
                        label: 'Extern',
                        icon: GraduationCap,
                      },
                      { value: 'none', label: 'Keine', icon: XCircle },
                    ]}
                    value={experienceFilter}
                    onChange={(v) =>
                      setExperienceFilter(v as ExperienceOption[])
                    }
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
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={clearAllFilters}>
                      <XIcon />
                      <span className="sr-only">Filter löschen</span>
                    </Button>
                  )}
                </div>
              )}

              {readonlyMode ? (
                (() => {
                  const visible = courses.filter((c) => {
                    const row = getRow(c.id)
                    return row?.isAssigned || row?.experience || row?.leadTime
                  })
                  return visible.length > 0 ? (
                    <ScrollArea className="min-h-0 flex-1">
                      <ItemGroup className="grid grid-cols-[repeat(auto-fill,minmax(20rem,1fr))] gap-3">
                        {visible.map((course) => {
                          const row = getRow(course.id)!
                          return (
                            <Item
                              key={course.id}
                              variant="outline"
                              size="sm"
                              className={
                                row.isAssigned
                                  ? 'border-primary bg-sidebar-accent/30 flex flex-nowrap'
                                  : 'flex flex-nowrap'
                              }>
                              <ItemMedia>
                                <Avatar className="size-10">
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
                                    : 'Master'}
                                  {course.semester != null
                                    ? ` | ${course.semester}. Semester`
                                    : ''}
                                </ItemDescription>
                              </ItemContent>
                            </Item>
                          )
                        })}
                      </ItemGroup>
                    </ScrollArea>
                  ) : (
                    <Empty className="flex-1">
                      <EmptyMedia variant={'icon'}>
                        <CircleQuestionMark />
                      </EmptyMedia>
                      <EmptyTitle>Keine Einträge</EmptyTitle>
                      <EmptyDescription>
                        Dieser Dozent ist derzeit keiner Vorlesung zugeordnet
                        oder qualifiziert.
                      </EmptyDescription>
                    </Empty>
                  )
                })()
              ) : filteredCourses.length > 0 ? (
                <ScrollArea className="min-h-0 flex-1">
                  <ItemGroup className="grid grid-cols-[repeat(auto-fill,minmax(20rem,1fr))] gap-3">
                    {filteredCourses
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
                      .map((course) => {
                        const row = getRow(course.id)
                        const isAssigned = !!row?.isAssigned
                        const hasQualification = !!(
                          row?.experience || row?.leadTime
                        )
                        return (
                          <Item
                            key={course.id}
                            variant="outline"
                            size="sm"
                            className={
                              isAssigned
                                ? 'border-primary bg-sidebar-accent/30 flex flex-nowrap'
                                : 'flex flex-nowrap'
                            }>
                            <ItemMedia>
                              <Avatar className={'size-10'}>
                                <AvatarFallback>
                                  {initialsFromName(course.name)}
                                </AvatarFallback>
                              </Avatar>
                            </ItemMedia>
                            <ItemContent>
                              <ItemTitle>{course.name}</ItemTitle>
                              <ItemDescription className="line-clamp-none">
                                {showPerRowLevelPref && (
                                  <>
                                    Präferenz:{' '}
                                    {row?.courseLevelPreference === 'bachelor'
                                      ? 'Bachelor'
                                      : row?.courseLevelPreference === 'master'
                                        ? 'Master'
                                        : '—'}
                                    <br />
                                  </>
                                )}
                                {course.courseLevel === 'bachelor'
                                  ? 'Bachelor'
                                  : 'Master'}
                                {course.semester != null
                                  ? ` | ${course.semester}. Semester`
                                  : ''}
                                {row?.experience || row?.leadTime ? (
                                  <>
                                    <br />
                                    {row?.experience &&
                                      experienceLabel[row.experience]}
                                    {row?.experience && row?.leadTime && ' | '}
                                    {row?.leadTime &&
                                      leadTimeLabel[row.leadTime]}
                                  </>
                                ) : null}
                              </ItemDescription>
                            </ItemContent>
                            <ItemActions>
                              <EditCourseAssignmentDialog
                                trigger={
                                  <Button variant="ghost" size="icon">
                                    <Pencil />
                                    <span className="sr-only">
                                      {course.name +
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
                                onSubmit={(d) => applyDetails(course.id, d)}
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => toggleAssigned(course.id)}>
                                {isAssigned ? <Trash2 /> : <Plus />}
                                <span className="sr-only">
                                  {isAssigned
                                    ? course.name + ' entfernen'
                                    : course.name + ' zuordnen'}
                                </span>
                              </Button>
                            </ItemActions>
                          </Item>
                        )
                      })}
                  </ItemGroup>
                </ScrollArea>
              ) : (
                <Empty className="flex-1">
                  <EmptyMedia variant={'icon'}>
                    <CircleQuestionMark />
                  </EmptyMedia>
                  <EmptyTitle>Keine Vorlesungen gefunden</EmptyTitle>
                  <EmptyDescription>
                    Bitte passen Sie Suche oder Filter an.
                  </EmptyDescription>
                </Empty>
              )}
            </>
          )}
        </div>
        <DialogFooter className="bg-background sticky bottom-0 z-10 items-end pt-2">
          <DialogClose asChild>
            <Button variant="outline">
              {readonly ? 'Schließen' : 'Abbrechen'}
            </Button>
          </DialogClose>
          {!readonlyMode && (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || effectiveHasExternalUpdate}>
              Speichern
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
