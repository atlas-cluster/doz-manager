'use server'

import { notifyTagsUpdated } from '@/features/shared/lib/cache-notify'
import { runInTransaction } from '@/features/shared/lib/transaction'

export async function deleteLecturers(ids: string[]) {
  await runInTransaction(async (tx) =>
    tx.lecturer.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    })
  )

  await notifyTagsUpdated(
    ['lecturers'],
    'lecturers:delete-lecturers',
    ids.map((id) => ({ entityType: 'lecturer' as const, entityId: id }))
  )
}
