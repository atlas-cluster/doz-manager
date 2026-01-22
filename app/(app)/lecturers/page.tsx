import {
  LecturerDataTable,
  getLecturers,
  lecturerColumns,
} from '@/features/lecturers'

export const dynamic = 'force-dynamic'

export default async function LecturersPage() {
  const lecturers = await getLecturers()

  return (
    <div>
      <LecturerDataTable
        columns={lecturerColumns}
        data={lecturers}
        refreshAction={getLecturers}
      />
    </div>
  )
}
