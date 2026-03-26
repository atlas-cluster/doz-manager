'use server'

import { notifyTagsUpdated } from '@/features/shared/lib/cache-notify'
import { prisma } from '@/features/shared/lib/prisma'

export async function deleteLecturers(ids: string[]) {
  await prisma.lecturer.deleteMany({
    where: {
      id: {
        in: ids,
      },
    },
  })

  await notifyTagsUpdated(
    ['lecturers'],
    'lecturers:delete-lecturers',
    ids.map((id) => ({ entityType: 'lecturer' as const, entityId: id }))
  )
}
