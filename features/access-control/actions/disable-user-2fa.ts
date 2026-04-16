'use server'

import { headers } from 'next/headers'

import { auth } from '@/features/auth/lib/auth'
import { notifyTagsUpdated } from '@/features/shared/lib/cache-notify'
import { runInTransaction } from '@/features/shared/lib/transaction'

export async function disableUser2FA(userId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user?.id) {
    throw new Error('Nicht authentifiziert')
  }

  await runInTransaction(async (tx) => {
    const caller = await tx.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true },
    })

    if (!caller?.isAdmin) {
      throw new Error('Keine Berechtigung')
    }

    await tx.twoFactor.deleteMany({
      where: { userId },
    })

    await tx.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: false },
    })
  })

  await notifyTagsUpdated(['users'], 'access-control:disable-user-2fa', [
    { entityType: 'user', entityId: userId },
  ])
}
