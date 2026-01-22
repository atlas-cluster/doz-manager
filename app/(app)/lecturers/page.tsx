import {
  CreateLecturerDialog,
  LecturerDataTable,
  lecturerColumns,
} from '@/features/lecturers'
import { DataTableTopActions } from '@/features/shared/components/data-table-top-actions'
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
      <DataTableTopActions right={<CreateLecturerDialog />} />
      <LecturerDataTable columns={lecturerColumns} data={lecturers} />
    </div>
  )
}
