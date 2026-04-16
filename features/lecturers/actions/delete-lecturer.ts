'use server'

import { notifyTagsUpdated } from '@/features/shared/lib/cache-notify'
import { runInTransaction } from '@/features/shared/lib/transaction'

export async function deleteLecturer(id: string) {
  await runInTransaction(async (tx) =>
    tx.lecturer.delete({
      where: {
        id,
      },
    })
  )

  await notifyTagsUpdated(['lecturers'], 'lecturers:delete-lecturer', [
    { entityType: 'lecturer', entityId: id },
  ])
}
