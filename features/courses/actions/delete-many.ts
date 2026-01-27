'use server'

import { prisma } from '@/features/shared/lib/prisma'

export async function deleteCourses(ids: string[]) {
  return prisma.course.deleteMany({
    where: {
      id: {
        in: ids,
      },
    },
  })
}
