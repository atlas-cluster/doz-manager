'use server'

import { notifyTagsUpdated } from '@/features/shared/lib/cache-notify'
import { runInTransaction } from '@/features/shared/lib/transaction'

export async function deleteCourse(id: string) {
  await runInTransaction(async (tx) =>
    tx.course.delete({
      where: {
        id,
      },
    })
  )

  await notifyTagsUpdated(['courses'], 'courses:delete-course', [
    { entityType: 'course', entityId: id },
  ])
}
