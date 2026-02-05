'use server'

import { Course } from '@/features/courses/types'
import { prisma } from '@/features/shared/lib/prisma'

export async function getLecturerCourseAssignments(
  lecturerId: string
): Promise<Course[]> {
  return prisma.course.findMany({
    where: {
      assignments: {
        some: { lecturerId },
      },
    },
    orderBy: { name: 'asc' },
  })
}
