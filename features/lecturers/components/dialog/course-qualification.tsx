import {
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  GraduationCap,
  Pencil,
  Timer,
  XCircle,
  XIcon,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import z from 'zod'

import { Course, CourseQualification, getCourses } from '@/features/courses'
import { Lecturer } from '@/features/lecturers'
import { createLecturerQualification } from '@/features/lecturers/actions/create-lecturer-course-qualification'
import { getLecturerCourseQualifications } from '@/features/lecturers/actions/get-lecturer-course-qualification'
import { updateLecturerQualification } from '@/features/lecturers/actions/update-lecturer-course-qualification'
import { EditQualificationDialog } from '@/features/lecturers/components/dialog/edit-course-qualification'
import { qualificationSchema } from '@/features/lecturers/schemas/lecturer'
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
import { initialsFromName } from '@/features/shared/lib/utils'

interface CourseQualificationDialogProps {
  lecturer: Lecturer
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CourseQualificationDialog({
  lecturer,
  open,
  onOpenChange,
}: CourseQualificationDialogProps) {
  const [courses, setCourses] = useState<Course[]>([])
  const [courseQualifications, setCourseQualifications] = useState<
    CourseQualification[]
  >([])
  const [editedCourseQualifications, setEditedCourseQualifications] = useState<
    CourseQualification[]
  >([])
  const [loading, setLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [searchQuery, setSearchQuery] = useState<string>('')
  const debouncedSearchQuery = useDebounce(searchQuery)

  type StatusFilterValue = 'qualified' | 'not_qualified'
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue[]>([])
  const [experienceFilter, setExperienceFilter] = useState<
    z.infer<typeof qualificationSchema>['experience'][]
  >([])
  const [leadTimeFilter, setLeadTimeFilter] = useState<
    z.infer<typeof qualificationSchema>['leadTime'][]
  >([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [coursesResponse, qualificationResponse] = await Promise.all([
          getCourses({ pageIndex: 0, pageSize: 999999999 }),
          getLecturerCourseQualifications(lecturer.id),
        ])
        setCourses(coursesResponse.data)
        setCourseQualifications(qualificationResponse)
        setEditedCourseQualifications(qualificationResponse)
      } catch (error) {
        console.error('Failed to fetch data', error)
        toast.error('Daten konnten nicht geladen werden')
      } finally {
        setLoading(false)
      }
    }
    if (open) {
      fetchData()
      setSearchQuery('')
    }
  }, [lecturer.id, open])

  const statusCounts = useMemo(() => {
    const map = new Map<string, number>()
    courses.forEach((course) => {
      const hasQualification = editedCourseQualifications.some(
        (cq) => cq.courseId === course.id
      )
      const key = hasQualification ? 'qualified' : 'not_qualified'
      map.set(key, (map.get(key) ?? 0) + 1)
    })
    return map
  }, [courses, editedCourseQualifications])

  const experienceCounts = useMemo(() => {
    const map = new Map<string, number>()
    courses.forEach((course) => {
      const cq = editedCourseQualifications.find(
        (q) => q.courseId === course.id
      )
      if (cq?.experience) {
        map.set(cq.experience, (map.get(cq.experience) ?? 0) + 1)
      }
    })
    return map
  }, [courses, editedCourseQualifications])

  const leadTimeCounts = useMemo(() => {
    const map = new Map<string, number>()
    courses.forEach((course) => {
      const cq = editedCourseQualifications.find(
        (q) => q.courseId === course.id
      )
      if (cq?.leadTime) {
        map.set(cq.leadTime, (map.get(cq.leadTime) ?? 0) + 1)
      }
    })
    return map
  }, [courses, editedCourseQualifications])

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      if (debouncedSearchQuery) {
        const searchLower = debouncedSearchQuery.toLowerCase()
        const matchesSearch = course.name.toLowerCase().includes(searchLower)
        if (!matchesSearch) return false
      }
      const cq = editedCourseQualifications.find(
        (q) => q.courseId === course.id
      )
      if (statusFilter.length > 0) {
        const hasQualification = !!cq
        const statusMatch =
          (statusFilter.includes('qualified') && hasQualification) ||
          (statusFilter.includes('not_qualified') && !hasQualification)
        if (!statusMatch) return false
      }
      if (experienceFilter.length > 0) {
        if (!cq || !experienceFilter.includes(cq.experience)) {
          return false
        }
      }
      if (leadTimeFilter.length > 0) {
        if (!cq || !leadTimeFilter.includes(cq.leadTime)) {
          return false
        }
      }
      return true
    })
  }, [
    courses,
    editedCourseQualifications,
    debouncedSearchQuery,
    statusFilter,
    experienceFilter,
    leadTimeFilter,
  ])

  const handleSubmit = async () => {
    setIsSubmitting(true)

    const courseQualificationsToCreate = editedCourseQualifications.filter(
      (editedCourseQualification) => {
        return !courseQualifications.find(
          (originalCourseQualification) =>
            originalCourseQualification.courseId ===
            editedCourseQualification.courseId
        )
      }
    ) //courseId in edited but not in original
    const courseQualificationsToUpdate = editedCourseQualifications.filter(
      (editedCourseQualification) => {
        return courseQualifications.find(
          (originalCourseQualification) =>
            originalCourseQualification.courseId ===
              editedCourseQualification.courseId &&
            (originalCourseQualification.experience !==
              editedCourseQualification.experience ||
              originalCourseQualification.leadTime !==
                editedCourseQualification.leadTime)
        )
      }
    ) //courseId in both

    const savePromise = (async () => {
      await Promise.all([
        ...courseQualificationsToCreate.map((quali) =>
          createLecturerQualification(lecturer.id, quali.courseId, {
            experience: quali.experience,
            leadTime: quali.leadTime,
          })
        ),
        ...courseQualificationsToUpdate.map((quali) =>
          updateLecturerQualification(lecturer.id, quali.courseId, {
            experience: quali.experience,
            leadTime: quali.leadTime,
          })
        ),
      ])
    })()

    toast.promise(savePromise, {
      loading: 'Qualifikationen werden gespeichert...',
      success: () => {
        setIsSubmitting(false)
        onOpenChange(false)
        return 'Qualifikationen erfolgreich gespeichert'
      },
      error: (err) => {
        setIsSubmitting(false)
        console.error('Failed to save qualifications', err)
        return 'Qualifikationen konnten nicht gespeichert werden'
      },
    })
  }

  const handleEditQualificationDialogSubmit = (
    data: z.infer<typeof qualificationSchema>,
    courseId: string
  ) => {
    setEditedCourseQualifications((prev) => {
      const existing = prev.find((cq) => cq.courseId === courseId)

      if (existing) {
        // Update existing qualification
        return prev.map((cq) =>
          cq.courseId === courseId
            ? { ...cq, experience: data.experience, leadTime: data.leadTime }
            : cq
        )
      } else {
        // Add new qualification
        return [
          ...prev,
          {
            lecturerId: lecturer.id,
            courseId: courseId,
            experience: data.experience,
            leadTime: data.leadTime,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ]
      }
    })
  }
  const hasActiveFilters =
    statusFilter.length > 0 ||
    experienceFilter.length > 0 ||
    leadTimeFilter.length > 0 ||
    debouncedSearchQuery !== ''

  const clearAllFilters = () => {
    setStatusFilter([])
    setExperienceFilter([])
    setLeadTimeFilter([])
    setSearchQuery('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={
          'flex h-[90vh] max-h-[90vh] min-w-[60vw] flex-col overflow-hidden'
        }>
        <DialogHeader className="sticky top-0 z-10 bg-background pb-2">
          <DialogTitle>
            Qualifikationen Bearbeiten -{' '}
            {lecturer.title ? lecturer.title + ' ' : ''}
            {lecturer.firstName}
            {lecturer.secondName ? ' ' + lecturer.secondName : ''}
            {' ' + lecturer.lastName}
          </DialogTitle>
          <DialogDescription>
            Hier können Sie die Qualifikationen für den Dozenten bearbeiten.
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
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  placeholder="Kurse suchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <DataTableFacetedFilter
                  title="Status"
                  options={[
                    {
                      value: 'qualified',
                      label: 'Mit Qualifikation',
                      icon: CheckCircle2,
                    },
                    {
                      value: 'not_qualified',
                      label: 'Ohne Qualifikation',
                      icon: XCircle,
                    },
                  ]}
                  value={statusFilter}
                  onChange={(value) =>
                    setStatusFilter(value as StatusFilterValue[])
                  }
                  facets={statusCounts}
                />
                <DataTableFacetedFilter
                  title="Erfahrung"
                  options={[
                    {
                      value: 'provadis',
                      label: 'Provadis',
                      icon: Building2,
                    },
                    {
                      value: 'other_uni',
                      label: 'Extern',
                      icon: GraduationCap,
                    },
                    {
                      value: 'none',
                      label: 'Keine',
                      icon: XCircle,
                    },
                  ]}
                  value={experienceFilter}
                  onChange={(value) =>
                    setExperienceFilter(
                      value as z.infer<
                        typeof qualificationSchema
                      >['experience'][]
                    )
                  }
                  facets={experienceCounts}
                />
                <DataTableFacetedFilter
                  title="Vorlaufzeit"
                  options={[
                    {
                      value: 'short',
                      label: 'Sofort',
                      icon: Timer,
                    },
                    {
                      value: 'four_weeks',
                      label: '4 Wochen',
                      icon: Clock,
                    },
                    {
                      value: 'more_weeks',
                      label: 'Mehr als 4 Wochen',
                      icon: Calendar,
                    },
                  ]}
                  value={leadTimeFilter}
                  onChange={(value) =>
                    setLeadTimeFilter(
                      value as z.infer<typeof qualificationSchema>['leadTime'][]
                    )
                  }
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
                <ItemGroup className="grid grid-cols-[repeat(auto-fill,minmax(20rem,1fr))] gap-3">
                  {filteredCourses.length > 0 ? (
                    filteredCourses.map((course) => (
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
                            {(() => {
                              const cq = editedCourseQualifications.find(
                                (cq) => cq.courseId === course.id
                              )
                              if (!cq) return 'Keine Qualifikationen vorhanden'

                              let experienceText: string
                              switch (cq.experience) {
                                case 'provadis':
                                  experienceText = 'Provadis'
                                  break
                                case 'other_uni':
                                  experienceText = 'Extern'
                                  break
                                case 'none':
                                  experienceText = 'Keine'
                                  break
                                default:
                                  experienceText = cq.experience
                              }

                              let leadTimeText: string
                              switch (cq.leadTime) {
                                case 'short':
                                  leadTimeText = 'Sofort'
                                  break
                                case 'four_weeks':
                                  leadTimeText = '4 Wochen'
                                  break
                                case 'more_weeks':
                                  leadTimeText = 'Mehr als 4 Wochen'
                                  break
                                default:
                                  leadTimeText = cq.leadTime
                              }

                              return (
                                <>
                                  Erfahrung: {experienceText}
                                  <br />
                                  Vorlaufzeit: {leadTimeText}
                                </>
                              )
                            })()}
                          </ItemDescription>
                        </ItemContent>
                        <ItemActions>
                          <EditQualificationDialog
                            trigger={
                              <Button variant={'ghost'} size={'icon'}>
                                <Pencil />
                                <span className={'sr-only'}>
                                  {course.name + ' bearbeiten'}
                                </span>
                              </Button>
                            }
                            onSubmit={handleEditQualificationDialogSubmit}
                            courseQualification={editedCourseQualifications.find(
                              (cq) => cq.courseId === course.id
                            )}
                            courseId={course.id}
                          />
                        </ItemActions>
                      </Item>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-8 text-muted-foreground">
                      Keine Kurse gefunden.
                    </div>
                  )}
                </ItemGroup>
              </ScrollArea>
            </>
          )}
        </div>
        <DialogFooter className="sticky bottom-0 z-10 items-end bg-background pt-2">
          <DialogClose asChild>
            <Button variant="outline">{'Abbrechen'}</Button>
          </DialogClose>
          {
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              Speichern
            </Button>
          }
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
