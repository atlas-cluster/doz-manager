'use server'

import { headers } from 'next/headers'

import { auth } from '@/features/auth/lib/auth'
import { notifyTagsUpdated } from '@/features/shared/lib/cache-notify'
import { runInTransaction } from '@/features/shared/lib/transaction'

export async function removeAuthMethod(userId: string, providerId: string) {
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

    // Ensure user keeps at least one auth method
    const accounts = await tx.account.findMany({
      where: { userId },
      select: { providerId: true },
    })

    const passkeys = await tx.passkey.findMany({
      where: { userId },
      select: { id: true },
    })

    const remainingAfterRemoval =
      accounts.filter((a) => a.providerId !== providerId).length +
      passkeys.length

    if (remainingAfterRemoval === 0) {
      throw new Error(
        'Mindestens eine Anmeldemethode muss verbleiben. Fügen Sie zuerst eine andere hinzu.'
      )
    }

    // If removing credential, also disable 2FA (requires password)
    if (providerId === 'credential') {
      await tx.twoFactor.deleteMany({ where: { userId } })
      await tx.user.update({
        where: { id: userId },
        data: { twoFactorEnabled: false },
      })
    }

    await tx.account.deleteMany({
      where: { userId, providerId },
    })
  })

  await notifyTagsUpdated(['users'], 'access-control:remove-auth-method', [
    { entityType: 'user', entityId: userId },
  ])
}
