'use server'

import { z } from 'zod'

import { courseSchema } from '@/features/courses/schemas/course'
import { notifyTagsUpdated } from '@/features/shared/lib/cache-notify'
import { prisma } from '@/features/shared/lib/prisma'

export async function updateCourse(
  id: string,
  data: z.infer<typeof courseSchema>
) {
  await prisma.course.update({
    where: { id },
    data: {
      name: data.name,
      isOpen: data.isOpen,
      courseLevel: data.courseLevel,
      semester: data.semester,
    },
  })

  await notifyTagsUpdated(['courses'], 'courses:update-course', [
    { entityType: 'course', entityId: id },
  ])
}
