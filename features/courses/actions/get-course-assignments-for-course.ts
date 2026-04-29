'use server'

import { unstable_cache } from 'next/cache'

import { CourseAssignment } from '@/features/courses/types'
import { prisma } from '@/features/shared/lib/prisma'

async function getCourseAssignmentsForCourseInternal(
  courseId: string
): Promise<CourseAssignment[]> {
  return prisma.courseAssignment.findMany({
    where: { courseId },
    include: { lecturer: true },
  })
}

export async function getCourseAssignmentsForCourse(
  courseId: string
): Promise<CourseAssignment[]> {
  return unstable_cache(
    async () => getCourseAssignmentsForCourseInternal(courseId),
    ['course-lecturer-assignments-get', courseId],
    {
      tags: ['courses', 'lecturers', `course-${courseId}-lecturers`],
      revalidate: 3600,
    }
  )()
}
