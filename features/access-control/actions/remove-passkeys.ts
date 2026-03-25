'use server'

import { updateTag } from 'next/cache'
import { headers } from 'next/headers'

import { auth } from '@/features/auth/lib/auth'
import { prisma } from '@/features/shared/lib/prisma'
import { publishScopeUpdate } from '@/features/shared/lib/update-stream'

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

  const caller = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isAdmin: true },
  })

  if (!caller?.isAdmin) {
    throw new Error('Keine Berechtigung')
  }

  const passkeys = await prisma.passkey.findMany({
    where: { userId },
    select: { id: true },
  })

  if (passkeys.length === 0) {
    throw new Error('Benutzer hat keine Passkeys.')
  }

  // Ensure user keeps at least one auth method
  const accounts = await prisma.account.findMany({
    where: { userId },
    select: { providerId: true },
  })

  if (accounts.length === 0) {
    throw new Error(
      'Mindestens eine Anmeldemethode muss verbleiben. Fügen Sie zuerst eine andere hinzu.'
    )
  }

  await prisma.passkey.deleteMany({ where: { userId } })

  updateTag('users')
  publishScopeUpdate('users')
}
