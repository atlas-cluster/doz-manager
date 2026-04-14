'use server'

import { notifyTagsUpdated } from '@/features/shared/lib/cache-notify'
import { prisma } from '@/features/shared/lib/prisma'

export async function deleteCourse(id: string) {
  await prisma.course.delete({
    where: {
      id,
    },
  })

  await notifyTagsUpdated(['courses'], 'courses:delete-course', [
    { entityType: 'course', entityId: id },
  ])
}
