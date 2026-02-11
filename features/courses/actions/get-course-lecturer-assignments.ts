'use server'

import { unstable_cache } from 'next/cache'

import { Lecturer } from '@/features/lecturers'
import { prisma } from '@/features/shared/lib/prisma'

async function getCourseLecturerAssignmentsInternal(
  courseId: string
): Promise<Lecturer[]> {
  return prisma.lecturer.findMany({
    where: {
      assignments: {
        some: { courseId },
      },
    },
    orderBy: { lastName: 'asc' },
  })
}

export async function getCourseLecturerAssignments(
  courseId: string
): Promise<Lecturer[]> {
  return unstable_cache(
    async () => getCourseLecturerAssignmentsInternal(courseId),
    ['course-lecturers-get', courseId],
    {
      tags: ['lecturers', 'courses', `course-${courseId}-lecturers`],
      revalidate: 3600,
    }
  )()
}
