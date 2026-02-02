'use server'

import { updateTag } from 'next/cache'
import { z } from 'zod'

import { courseSchema } from '@/features/courses/schemas/course'
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

  updateTag('courses')
}
