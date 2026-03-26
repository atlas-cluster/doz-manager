'use server'

import { notifyTagsUpdated } from '@/features/shared/lib/cache-notify'
import { prisma } from '@/features/shared/lib/prisma'

export async function deleteCourses(ids: string[]) {
  await prisma.course.deleteMany({
    where: {
      id: {
        in: ids,
      },
    },
  })

  await notifyTagsUpdated(
    ['courses'],
    'courses:delete-courses',
    ids.map((id) => ({ entityType: 'course' as const, entityId: id }))
  )
}
