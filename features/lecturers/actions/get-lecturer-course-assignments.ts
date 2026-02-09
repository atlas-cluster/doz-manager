'use server'

import { unstable_cache } from 'next/cache'

import { Course } from '@/features/courses'
import { prisma } from '@/features/shared/lib/prisma'

async function getLecturerCourseAssignmentsInternal(
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

export async function getLecturerCourseAssignments(
  lecturerId: string
): Promise<Course[]> {
  return unstable_cache(
    async () => getLecturerCourseAssignmentsInternal(lecturerId),
    ['lecturer-courses-get', lecturerId],
    {
      tags: ['lecturers', 'courses', `lecturer-${lecturerId}-courses`],
      revalidate: 3600,
    }
  )()
}
