'use server'

import { createId } from '@paralleldrive/cuid2'
import { hashPassword } from 'better-auth/crypto'
import { headers } from 'next/headers'

import { auth } from '@/features/auth/lib/auth'
import { notifyTagsUpdated } from '@/features/shared/lib/cache-notify'
import { runInTransaction } from '@/features/shared/lib/transaction'

/**
 * Add a credential (password) auth method to an existing user.
 * Social methods don't need admin action — they link automatically on first login.
 */
export async function addAuthMethod(userId: string, password: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user?.id) {
    throw new Error('Nicht authentifiziert')
  }

  if (!password || password.length < 8) {
    throw new Error('Das Passwort muss mindestens 8 Zeichen lang sein.')
  }

  const hashed = await hashPassword(password)

  await runInTransaction(async (tx) => {
    const caller = await tx.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true },
    })

    if (!caller?.isAdmin) {
      throw new Error('Keine Berechtigung')
    }

    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { id: true },
    })

    if (!user) {
      throw new Error('Benutzer nicht gefunden')
    }

    const existing = await tx.account.findFirst({
      where: { userId, providerId: 'credential' },
    })

    if (existing) {
      throw new Error('Benutzer hat bereits ein Passwort.')
    }

    await tx.account.create({
      data: {
        id: createId(),
        userId,
        providerId: 'credential',
        accountId: userId,
        password: hashed,
      },
    })
  })

  await notifyTagsUpdated(['users'], 'access-control:add-auth-method', [
    { entityType: 'user', entityId: userId },
  ])
}
