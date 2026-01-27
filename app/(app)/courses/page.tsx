import { CourseDataTable, getCourses } from '@/features/courses'

export const dynamic = 'force-dynamic'

export default async function CoursesPage() {
  const data = await getCourses()

  return (
    <div>
      <CourseDataTable data={data} />
    </div>
  )
}
