'use server'

import { unstable_cache } from 'next/cache'

import { Course } from '@/features/courses'
import { Lecturer } from '@/features/lecturers'
import { prisma } from '@/features/shared/lib/prisma'

export async function getLecturerInternal(
  lecturerId: string
): Promise<{ lecturer: Lecturer; courses: Course[] }> {
  const lecturer = await prisma.lecturer.findUnique({
    where: { id: lecturerId },
  })

  const courses = await prisma.course.findMany({
    where: {
      assignments: {
        some: { lecturerId },
      },
    },
    orderBy: { name: 'asc' },
  })

  if (!lecturer) {
    throw new Error('Lecturer not found')
  }

  return { lecturer, courses }
}

export async function getLecturer(
  lecturerId: string
): Promise<{ lecturer: Lecturer; courses: Course[] }> {
  return unstable_cache(
    async () => getLecturerInternal(lecturerId),
    ['lecturer-get', lecturerId],
    {
      tags: ['lecturers', 'courses'],
      revalidate: 3600,
    }
  )()
}
