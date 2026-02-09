'use server'

import { updateTag } from 'next/cache'

import { prisma } from '@/features/shared/lib/prisma'

export async function deleteLecturer(id: string) {
  await prisma.lecturer.delete({
    where: {
      id,
    },
  })

  updateTag('lecturers')
}
