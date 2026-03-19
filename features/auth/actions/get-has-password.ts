'use server'

import { headers } from 'next/headers'

import { auth } from '@/features/auth/lib/auth'
import { prisma } from '@/features/shared/lib/prisma'

/**
 * Check whether the current user has a credential (password) account.
 */
export async function getHasPassword(): Promise<boolean> {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user?.id) {
    return false
  }

  const account = await prisma.account.findFirst({
    where: { userId: session.user.id, providerId: 'credential' },
    select: { id: true },
  })

  return !!account
}
