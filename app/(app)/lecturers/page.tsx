import { LecturerDataTable, lecturerColumns } from '@/features/lecturers'
import { prisma } from '@/features/shared/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function LecturersPage() {
  const lecturers = await prisma.lecturer.findMany({
    orderBy: {
      lastName: 'asc',
    },
  })

  return (
    <div>
      <LecturerDataTable columns={lecturerColumns} data={lecturers} />
    </div>
  )
}
