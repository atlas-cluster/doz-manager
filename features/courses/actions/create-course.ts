'use server'

import { z } from 'zod'

import { courseSchema } from '@/features/courses/schemas/course'
import { notifyTagsUpdated } from '@/features/shared/lib/cache-notify'
import { runInTransaction } from '@/features/shared/lib/transaction'

export async function createCourse(data: z.infer<typeof courseSchema>) {
  await runInTransaction(async (tx) =>
    tx.course.create({
      data: {
        name: data.name,
        isOpen: data.isOpen,
        courseLevel: data.courseLevel,
        semester: data.semester,
      },
    })
  )

  await notifyTagsUpdated(['courses'], 'courses:create-course')
}
