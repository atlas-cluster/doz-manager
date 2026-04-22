'use server'

import { prisma } from '@/features/shared/lib/prisma'

export async function isChatEnabled(): Promise<boolean> {
  const row = await prisma.aiSettings.findUnique({
    where: { id: 'singleton' },
    select: { enabled: true },
  })

  return row?.enabled ?? true
}
