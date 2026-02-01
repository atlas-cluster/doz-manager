'use server'

import { revalidateTag } from 'next/cache'

import { prisma } from '@/features/shared/lib/prisma'

export async function deleteCourses(ids: string[]) {
  await prisma.course.deleteMany({
    where: {
      id: {
        in: ids,
      },
    },
  })

  revalidateTag('courses', '')
}
