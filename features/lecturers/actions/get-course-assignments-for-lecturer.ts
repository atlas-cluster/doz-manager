'use server'

import { unstable_cache } from 'next/cache'

import { CourseAssignment } from '@/features/courses/types'
import { prisma } from '@/features/shared/lib/prisma'

async function getCourseAssignmentsForLecturerInternal(
  lecturerId: string
): Promise<CourseAssignment[]> {
  return prisma.courseAssignment.findMany({
    where: { lecturerId },
    include: { course: true },
  })
}

export async function getCourseAssignmentsForLecturer(
  lecturerId: string
): Promise<CourseAssignment[]> {
  return unstable_cache(
    async () => getCourseAssignmentsForLecturerInternal(lecturerId),
    ['lecturer-course-assignments-get', lecturerId],
    {
      tags: ['lecturers', 'courses', `lecturer-${lecturerId}-courses`],
      revalidate: 3600,
    }
  )()
}
