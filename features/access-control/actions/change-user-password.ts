'use server'

import { hashPassword } from 'better-auth/crypto'
import { updateTag } from 'next/cache'
import { headers } from 'next/headers'

import { auth } from '@/features/auth/lib/auth'
import { prisma } from '@/features/shared/lib/prisma'
import { publishScopeUpdate } from '@/features/shared/lib/update-stream'

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

  await prisma.account.updateMany({
    where: { userId, providerId: 'credential' },
    data: { password: hashedPassword },
  })

  updateTag('users')
  publishScopeUpdate('users')
}
