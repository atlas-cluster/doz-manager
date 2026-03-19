'use server'

import { updateTag } from 'next/cache'
import { headers } from 'next/headers'

import { auth } from '@/features/auth/lib/auth'
import { prisma } from '@/features/shared/lib/prisma'

export async function removeAuthMethod(userId: string, providerId: string) {
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

  // Ensure user keeps at least one auth method
  const accounts = await prisma.account.findMany({
    where: { userId },
    select: { providerId: true },
  })

  const passkeys = await prisma.passkey.findMany({
    where: { userId },
    select: { id: true },
  })

  const remainingAfterRemoval =
    accounts.filter((a) => a.providerId !== providerId).length + passkeys.length

  if (remainingAfterRemoval === 0) {
    throw new Error(
      'Mindestens eine Anmeldemethode muss verbleiben. Fügen Sie zuerst eine andere hinzu.'
    )
  }

  // If removing credential, also disable 2FA (requires password)
  if (providerId === 'credential') {
    await prisma.twoFactor.deleteMany({ where: { userId } })
    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: false },
    })
  }

  await prisma.account.deleteMany({
    where: { userId, providerId },
  })

  updateTag('users')
}
