'use server'

import { prisma } from '@/features/shared/lib/prisma'

export async function deleteLecturers(ids: string[]) {
  return prisma.lecturer.deleteMany({
    where: {
      id: {
        in: ids,
      },
    },
  })
}
