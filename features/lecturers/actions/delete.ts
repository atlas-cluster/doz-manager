'use server'

import { refresh } from 'next/cache'

import { prisma } from '@/features/shared/lib/prisma'

export async function deleteLecturer(id: string) {
  await prisma.lecturer.delete({
    where: {
      id,
    },
  })
}
