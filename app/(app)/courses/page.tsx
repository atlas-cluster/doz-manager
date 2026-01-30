import { CourseDataTable, getCourses } from '@/features/courses'

export const dynamic = 'force-dynamic'

export default async function CoursesPage() {
  const courses = await getCourses()

  return (
    <div>
      <CourseDataTable initialData={courses} />
    </div>
  )
}
