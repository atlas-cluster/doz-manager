'use server'

import { headers } from 'next/headers'

import { auth } from '@/features/auth/lib/auth'
import { notifyTagsUpdated } from '@/features/shared/lib/cache-notify'
import { runInTransaction } from '@/features/shared/lib/transaction'

/**
 * Remove all passkeys for a user (admin action).
 */
export async function removePasskeys(userId: string) {
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

    const passkeys = await tx.passkey.findMany({
      where: { userId },
      select: { id: true },
    })

    if (passkeys.length === 0) {
      throw new Error('Benutzer hat keine Passkeys.')
    }

    // Ensure user keeps at least one auth method
    const accounts = await tx.account.findMany({
      where: { userId },
      select: { providerId: true },
    })

    if (accounts.length === 0) {
      throw new Error(
        'Mindestens eine Anmeldemethode muss verbleiben. Fügen Sie zuerst eine andere hinzu.'
      )
    }

    await tx.passkey.deleteMany({ where: { userId } })
  })

  await notifyTagsUpdated(['users'], 'access-control:remove-passkeys', [
    { entityType: 'user', entityId: userId },
  ])
}
