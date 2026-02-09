'use server'

import { updateTag } from 'next/cache'

import { prisma } from '@/features/shared/lib/prisma'

export async function deleteLecturers(ids: string[]) {
  await prisma.lecturer.deleteMany({
    where: {
      id: {
        in: ids,
      },
    },
  })

  updateTag('lecturers')
}
