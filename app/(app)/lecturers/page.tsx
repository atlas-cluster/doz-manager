import { LecturerDataTable, getLecturers } from '@/features/lecturers'
import { parseTableSearchParams } from '@/features/shared/hooks/parse-table-search-params'

export const dynamic = 'force-dynamic'

export default async function LecturersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const tableParams = parseTableSearchParams(params)
  const lecturers = await getLecturers(tableParams)

  return (
    <div>
      <LecturerDataTable initialData={lecturers} />
    </div>
  )
}
