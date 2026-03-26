'use server'

import { z } from 'zod'

import { courseSchema } from '@/features/courses/schemas/course'
import { notifyTagsUpdated } from '@/features/shared/lib/cache-notify'
import { prisma } from '@/features/shared/lib/prisma'

export async function createCourse(data: z.infer<typeof courseSchema>) {
  await prisma.course.create({
    data: {
      name: data.name,
      isOpen: data.isOpen,
      courseLevel: data.courseLevel,
      semester: data.semester,
    },
  })

  await notifyTagsUpdated(['courses'], 'courses:create-course')
}
