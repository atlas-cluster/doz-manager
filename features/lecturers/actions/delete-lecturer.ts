'use server'

import { notifyTagsUpdated } from '@/features/shared/lib/cache-notify'
import { prisma } from '@/features/shared/lib/prisma'

export async function deleteLecturer(id: string) {
  await prisma.lecturer.delete({
    where: {
      id,
    },
  })

  await notifyTagsUpdated(['lecturers'], 'lecturers:delete-lecturer', [
    { entityType: 'lecturer', entityId: id },
  ])
}
