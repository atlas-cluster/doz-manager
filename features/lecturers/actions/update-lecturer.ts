'use server'

import z from 'zod'

import { lecturerSchema } from '@/features/lecturers/schemas/lecturer'
import { notifyTagsUpdated } from '@/features/shared/lib/cache-notify'
import { runInTransaction } from '@/features/shared/lib/transaction'

export async function updateLecturer(
  id: string,
  data: z.infer<typeof lecturerSchema>
) {
  await runInTransaction(async (tx) => {
    await tx.lecturer.update({
      where: { id },
      data: {
        title: data.title,
        firstName: data.firstName,
        secondName: data.secondName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        type: data.type,
        courseLevelPreference: data.courseLevelPreference,
      },
    })

    // Per-assignment courseLevelPreference overrides only make sense while
    // the lecturer's own preference is "both". Clear them otherwise to keep
    // data consistent.
    if (data.courseLevelPreference !== 'both') {
      await tx.courseAssignment.updateMany({
        where: { lecturerId: id, NOT: { courseLevelPreference: null } },
        data: { courseLevelPreference: null },
      })
    }
  })

  await notifyTagsUpdated(['lecturers'], 'lecturers:update-lecturer', [
    { entityType: 'lecturer', entityId: id },
  ])
}
