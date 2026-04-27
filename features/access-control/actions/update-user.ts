'use server'

import { headers } from 'next/headers'
import { z } from 'zod'

import { userSchema } from '@/features/access-control/schemas/user'
import { auth } from '@/features/auth/lib/auth'
import { notifyTagsUpdated } from '@/features/shared/lib/cache-notify'
import { prisma } from '@/features/shared/lib/prisma'
import { runInTransaction } from '@/features/shared/lib/transaction'

export async function updateUser(id: string, data: z.infer<typeof userSchema>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user?.id) {
    throw new Error('Nicht authentifiziert')
  }

  const caller = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isAdmin: true },
  })

  if (!caller?.isAdmin) {
    throw new Error('Keine Berechtigung')
  }

  await runInTransaction(async (tx) =>
    tx.user.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        image: data.image === '' ? null : (data.image ?? undefined),
      },
    })
  )

  await notifyTagsUpdated(['users'], 'access-control:update-user', [
    { entityType: 'user', entityId: id },
  ])
}
