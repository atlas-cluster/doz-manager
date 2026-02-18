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

import { createCourseLecturerQualification } from '@/features/courses/actions/create-course-lecturer-qualification'
import { getCourseLecturerQualifications } from '@/features/courses/actions/get-course-lecturer-qualifications'
import { updateCourseLecturerQualification } from '@/features/courses/actions/update-course-lecturer-qualification'
import { EditQualificationDialog } from '@/features/courses/components/dialog/edit-lecturer-qualification'
import { Course, CourseQualification } from '@/features/courses/types'
import { Lecturer, getLecturers } from '@/features/lecturers'
import { qualificationSchema } from '@/features/lecturers'
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
import { LeadTimeOption } from '@/features/shared/lib/generated/prisma/enums'
import { ExperienceOption } from '@/features/shared/lib/generated/prisma/enums'
import { initialsFromName } from '@/features/shared/lib/utils'

interface LecturerQualificationDialogProps {
  course: Course
  open: boolean
  onOpenChange: (open: boolean) => void
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

export function LecturerQualificationDialog({
  course,
  open,
  onOpenChange,
}: LecturerQualificationDialogProps) {
  const [lecturers, setLecturers] = useState<Lecturer[]>([])
  const [lecturerQualifications, setLecturerQualifications] = useState<
    CourseQualification[]
  >([])
  const [editedLecturerQualifications, setEditedLecturerQualifications] =
    useState<CourseQualification[]>([])
  const [loading, setLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [searchQuery, setSearchQuery] = useState<string>('')
  const debouncedSearchQuery = useDebounce(searchQuery)

  type StatusFilterValue = 'qualified' | 'not_qualified'
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue[]>([])
  const [experienceFilter, setExperienceFilter] = useState<ExperienceOption[]>(
    []
  )
  const [leadTimeFilter, setLeadTimeFilter] = useState<LeadTimeOption[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [lecturersResponse, qualificationResponse] = await Promise.all([
          getLecturers({ pageIndex: 0, pageSize: 999999999 }),
          getCourseLecturerQualifications(course.id),
        ])
        setLecturers(lecturersResponse.data)
        setLecturerQualifications(qualificationResponse)
        setEditedLecturerQualifications(qualificationResponse)
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
  }, [course.id, open])

  const statusCounts = useMemo(() => {
    const map = new Map<string, number>()
    lecturers.forEach((lecturer) => {
      const hasQualification = editedLecturerQualifications.some(
        (lq) => lq.lecturerId === lecturer.id
      )
      const key = hasQualification ? 'qualified' : 'not_qualified'
      map.set(key, (map.get(key) ?? 0) + 1)
    })
    return map
  }, [lecturers, editedLecturerQualifications])

  const experienceCounts = useMemo(() => {
    const map = new Map<string, number>()
    lecturers.forEach((lecturer) => {
      const lq = editedLecturerQualifications.find(
        (q) => q.lecturerId === lecturer.id
      )
      if (lq?.experience) {
        map.set(lq.experience, (map.get(lq.experience) ?? 0) + 1)
      }
    })
    return map
  }, [lecturers, editedLecturerQualifications])

  const leadTimeCounts = useMemo(() => {
    const map = new Map<string, number>()
    lecturers.forEach((lecturer) => {
      const lq = editedLecturerQualifications.find(
        (q) => q.lecturerId === lecturer.id
      )
      if (lq?.leadTime) {
        map.set(lq.leadTime, (map.get(lq.leadTime) ?? 0) + 1)
      }
    })
    return map
  }, [lecturers, editedLecturerQualifications])

  const filteredLecturers = useMemo(() => {
    return lecturers.filter((lecturer) => {
      if (debouncedSearchQuery) {
        const searchLower = debouncedSearchQuery.toLowerCase()
        const fullName = lecturerDisplayName(lecturer).toLowerCase()
        const matchesSearch = fullName.includes(searchLower)
        if (!matchesSearch) return false
      }
      const lq = editedLecturerQualifications.find(
        (q) => q.lecturerId === lecturer.id
      )
      if (statusFilter.length > 0) {
        const hasQualification = !!lq
        const statusMatch =
          (statusFilter.includes('qualified') && hasQualification) ||
          (statusFilter.includes('not_qualified') && !hasQualification)
        if (!statusMatch) return false
      }
      if (experienceFilter.length > 0) {
        if (!lq || !experienceFilter.includes(lq.experience)) {
          return false
        }
      }
      if (leadTimeFilter.length > 0) {
        if (!lq || !leadTimeFilter.includes(lq.leadTime)) {
          return false
        }
      }
      return true
    })
  }, [
    lecturers,
    editedLecturerQualifications,
    debouncedSearchQuery,
    statusFilter,
    experienceFilter,
    leadTimeFilter,
  ])

  const handleSubmit = async () => {
    setIsSubmitting(true)

    const qualificationsToCreate = editedLecturerQualifications.filter(
      (editedQualification) => {
        return !lecturerQualifications.find(
          (originalQualification) =>
            originalQualification.lecturerId === editedQualification.lecturerId
        )
      }
    )
    const qualificationsToUpdate = editedLecturerQualifications.filter(
      (editedQualification) => {
        return lecturerQualifications.find(
          (originalQualification) =>
            originalQualification.lecturerId ===
              editedQualification.lecturerId &&
            (originalQualification.experience !==
              editedQualification.experience ||
              originalQualification.leadTime !== editedQualification.leadTime)
        )
      }
    )

    const savePromise = (async () => {
      await Promise.all([
        ...qualificationsToCreate.map((quali) =>
          createCourseLecturerQualification(course.id, quali.lecturerId, {
            experience: quali.experience,
            leadTime: quali.leadTime,
          })
        ),
        ...qualificationsToUpdate.map((quali) =>
          updateCourseLecturerQualification(course.id, quali.lecturerId, {
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
    lecturerId: string
  ) => {
    setEditedLecturerQualifications((prev) => {
      const existing = prev.find((lq) => lq.lecturerId === lecturerId)

      if (existing) {
        return prev.map((lq) =>
          lq.lecturerId === lecturerId
            ? { ...lq, experience: data.experience, leadTime: data.leadTime }
            : lq
        )
      } else {
        return [
          ...prev,
          {
            lecturerId: lecturerId,
            courseId: course.id,
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
          <DialogTitle>Qualifikationen Bearbeiten - {course.name}</DialogTitle>
          <DialogDescription>
            Hier können Sie die Qualifikationen der Dozenten für diese Vorlesung
            bearbeiten.
          </DialogDescription>
        </DialogHeader>
        <div className={'flex min-h-0 flex-1 flex-col gap-3'}>
          {loading ? (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <Skeleton className="h-9 w-[200px]" />
                <Skeleton className="h-9 w-[120px]" />
                <Skeleton className="h-9 w-[120px]" />
                <Skeleton className="h-9 w-[120px]" />
              </div>
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
              <div className="flex w-full flex-wrap items-center gap-2">
                <div className="flex w-full gap-2 md:w-64">
                  <Input
                    placeholder="Dozenten suchen..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
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
                    setExperienceFilter(value as ExperienceOption[])
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
                    setLeadTimeFilter(value as LeadTimeOption[])
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
                  {filteredLecturers.length > 0 ? (
                    filteredLecturers.map((lecturer) => (
                      <Item
                        key={lecturer.id}
                        variant="outline"
                        size={'sm'}
                        className={'flex flex-nowrap'}>
                        <ItemMedia className="flex h-full items-center justify-center">
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
                            {(() => {
                              const lq = editedLecturerQualifications.find(
                                (lq) => lq.lecturerId === lecturer.id
                              )
                              if (!lq) return 'Keine Qualifikationen vorhanden'

                              let experienceText: string
                              switch (lq.experience) {
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
                                  experienceText = lq.experience
                              }

                              let leadTimeText: string
                              switch (lq.leadTime) {
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
                                  leadTimeText = lq.leadTime
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
                                  {lecturerDisplayName(lecturer) +
                                    ' bearbeiten'}
                                </span>
                              </Button>
                            }
                            onSubmit={handleEditQualificationDialogSubmit}
                            courseQualification={editedLecturerQualifications.find(
                              (lq) => lq.lecturerId === lecturer.id
                            )}
                            lecturerId={lecturer.id}
                          />
                        </ItemActions>
                      </Item>
                    ))
                  ) : (
                    <div className="col-span-full py-8 text-center text-muted-foreground">
                      Keine Dozenten gefunden.
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
