'use server'

import { Course } from '@/features/courses/types'
import { prisma } from '@/features/shared/lib/prisma'

export async function getCourses(): Promise<Course[]> {
  return prisma.course.findMany({
    orderBy: {
      name: 'asc',
    },
  })
}
