'use server'

import { refresh } from 'next/cache'
import { z } from 'zod'

import { courseSchema } from '@/features/courses/schemas/course.schema'
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

  refresh()
}
