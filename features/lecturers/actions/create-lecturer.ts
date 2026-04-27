'use server'

import { z } from 'zod'

import { lecturerSchema } from '@/features/lecturers/schemas/lecturer'
import { notifyTagsUpdated } from '@/features/shared/lib/cache-notify'
import { runInTransaction } from '@/features/shared/lib/transaction'

export async function createLecturer(data: z.infer<typeof lecturerSchema>) {
  await runInTransaction(async (tx) =>
    tx.lecturer.create({
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
  )

  await notifyTagsUpdated(['lecturers'], 'lecturers:create-lecturer')
}
