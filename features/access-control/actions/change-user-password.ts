'use server'

import { hashPassword } from 'better-auth/crypto'
import { headers } from 'next/headers'

import { auth } from '@/features/auth/lib/auth'
import { notifyTagsUpdated } from '@/features/shared/lib/cache-notify'
import { prisma } from '@/features/shared/lib/prisma'
import { runInTransaction } from '@/features/shared/lib/transaction'

export async function changeUserPassword(userId: string, newPassword: string) {
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

  if (newPassword.length < 8) {
    throw new Error('Das Passwort muss mindestens 8 Zeichen lang sein.')
  }

  const hashedPassword = await hashPassword(newPassword)

  await runInTransaction(async (tx) =>
    tx.account.updateMany({
      where: { userId, providerId: 'credential' },
      data: { password: hashedPassword },
    })
  )

  await notifyTagsUpdated(['users'], 'access-control:change-user-password', [
    { entityType: 'user', entityId: userId },
  ])
}
