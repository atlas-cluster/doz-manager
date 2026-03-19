'use server'

import { verifyPassword } from 'better-auth/crypto'
import { updateTag } from 'next/cache'
import { headers } from 'next/headers'

import { auth } from '@/features/auth/lib/auth'
import { prisma } from '@/features/shared/lib/prisma'

export async function deleteAccount(password?: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user?.id) {
    throw new Error('Nicht authentifiziert')
  }

  // Check if the user has a credential (password) account
  const account = await prisma.account.findFirst({
    where: {
      userId: session.user.id,
      providerId: 'credential',
    },
    select: { password: true },
  })

  if (account?.password) {
    // User has a password — require verification
    if (!password) {
      throw new Error('Bitte geben Sie Ihr Passwort ein.')
    }

    const isValid = await verifyPassword({
      hash: account.password,
      password,
    })

    if (!isValid) {
      throw new Error('Falsches Passwort.')
    }
  }

  // Delete the user (cascades delete sessions, accounts, etc.)
  await prisma.user.delete({
    where: { id: session.user.id },
  })

  updateTag('users')

  return { success: true }
}
