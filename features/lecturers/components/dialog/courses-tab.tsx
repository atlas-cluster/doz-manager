import { ChevronsUpDown } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { z } from 'zod'

import { getCourses } from '@/features/courses'
import { Course } from '@/features/courses'
import { lecturerSchema } from '@/features/lecturers/schemas/lecturer'
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
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from '@/features/shared/components/ui/item'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/features/shared/components/ui/popover'
import { ScrollArea } from '@/features/shared/components/ui/scroll-area'
import { Skeleton } from '@/features/shared/components/ui/skeleton'

export function CoursesTab(props: { isLoading: boolean }) {
  const { watch, setValue } = useFormContext<z.infer<typeof lecturerSchema>>()
  const courseIds = watch('courseIds')
  const [open, setOpen] = useState(false)
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  const mergedLoading = props.isLoading || loading

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true)
        const response = await getCourses({ pageIndex: 0, pageSize: 999999999 })
        setCourses(response.data)
      } catch (error) {
        console.error('Failed to fetch courses', error)
      } finally {
        setLoading(false)
      }
    }
    fetchCourses()
  }, [])

  const toggleCourse = (courseId: string) => {
    const current = new Set(courseIds)
    if (current.has(courseId)) {
      current.delete(courseId)
    } else {
      current.add(courseId)
    }
    setValue('courseIds', Array.from(current), { shouldDirty: true })
  }

  const selectedCourses = courses.filter((c) => courseIds.includes(c.id))

  if (mergedLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-9 w-50 mb-3 mt-1" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 h-100">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <>
      <Popover open={open} onOpenChange={setOpen} modal>
        <PopoverTrigger asChild className="mb-3 mt-1">
          <Button variant="outline" suppressHydrationWarning>
            {courseIds.length > 0
              ? `${courseIds.length} Kurs(e) ausgewählt`
              : 'Kurse auswählen...'}
            <ChevronsUpDown />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0" align="start">
          <Command>
            <CommandInput placeholder="Suche Kurse..." />
            <CommandList>
              <CommandEmpty>Keine Kurse gefunden.</CommandEmpty>
              <CommandGroup>
                {courses.map((course) => (
                  <CommandItem
                    key={course.id}
                    onSelect={() => toggleCourse(course.id)}
                    value={course.name}>
                    <Checkbox
                      checked={courseIds.includes(course.id)}
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
      <ScrollArea className="h-100">
        <ItemGroup className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {selectedCourses.length > 0 ? (
            selectedCourses.map((course) => (
              <Item key={course.id} variant="outline">
                <ItemContent>
                  <ItemTitle>{course.name}</ItemTitle>
                  <ItemDescription>
                    {course.courseLevel === 'bachelor' ? 'Bachelor' : 'Master'}{' '}
                    | {course.semester}. Semester
                  </ItemDescription>
                </ItemContent>
              </Item>
            ))
          ) : (
            <Item key="empty" variant="outline">
              <ItemContent>
                <ItemTitle>Keine Kurse ausgewählt</ItemTitle>
              </ItemContent>
            </Item>
          )}
        </ItemGroup>
      </ScrollArea>
    </>
  )
}
