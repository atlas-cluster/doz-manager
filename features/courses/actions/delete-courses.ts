'use server'

import { notifyTagsUpdated } from '@/features/shared/lib/cache-notify'
import { runInTransaction } from '@/features/shared/lib/transaction'

export async function deleteCourses(ids: string[]) {
  await runInTransaction(async (tx) =>
    tx.course.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    })
  )

  await notifyTagsUpdated(
    ['courses'],
    'courses:delete-courses',
    ids.map((id) => ({ entityType: 'course' as const, entityId: id }))
  )
}
