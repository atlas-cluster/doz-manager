import { CourseDataTable, getCourses } from '@/features/courses'
import { parseTableSearchParams } from '@/features/shared/hooks/parse-table-search-params'

export const dynamic = 'force-dynamic'

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const tableParams = parseTableSearchParams(params)
  const courses = await getCourses(tableParams)

  return (
    <div>
      <CourseDataTable initialData={courses} />
    </div>
  )
}
