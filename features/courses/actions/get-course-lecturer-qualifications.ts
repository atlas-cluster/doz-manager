'use server'

import { unstable_cache } from 'next/cache'

import { CourseQualification } from '@/features/courses'
import { prisma } from '@/features/shared/lib/prisma'

async function getCourseLecturerQualificationsInternal(
  courseId: string
): Promise<CourseQualification[]> {
  return prisma.courseQualification.findMany({
    where: {
      courseId: courseId,
    },
  })
}

export async function getCourseLecturerQualifications(
  courseId: string
): Promise<CourseQualification[]> {
  return unstable_cache(
    async () => getCourseLecturerQualificationsInternal(courseId),
    ['course-lecturers-qualifications-get', courseId],
    {
      tags: ['courses', 'lecturers', `course-${courseId}-lecturers`],
      revalidate: 3600,
    }
  )()
}
