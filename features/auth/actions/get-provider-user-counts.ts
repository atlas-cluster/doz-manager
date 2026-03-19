'use server'

import { headers } from 'next/headers'

import { auth } from '@/features/auth/lib/auth'
import type { ProviderUserCounts } from '@/features/auth/types'
import { prisma } from '@/features/shared/lib/prisma'

/**
 * Count unique users per auth provider.
 * - password = accounts with providerId "credential"
 * - passkey  = users who have at least one passkey
 * - microsoft / github / oauth = accounts by providerId
 */
export async function getProviderUserCounts(): Promise<ProviderUserCounts> {
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

  const [passwordCount, passkeyCount, microsoftCount, githubCount, oauthCount] =
    await Promise.all([
      prisma.account.groupBy({
        by: ['userId'],
        where: { providerId: 'credential' },
      }),
      prisma.passkey.groupBy({
        by: ['userId'],
      }),
      prisma.account.groupBy({
        by: ['userId'],
        where: { providerId: 'microsoft' },
      }),
      prisma.account.groupBy({
        by: ['userId'],
        where: { providerId: 'github' },
      }),
      prisma.account.groupBy({
        by: ['userId'],
        where: {
          providerId: { notIn: ['credential', 'microsoft', 'github'] },
        },
      }),
    ])

  return {
    password: passwordCount.length,
    passkey: passkeyCount.length,
    microsoft: microsoftCount.length,
    github: githubCount.length,
    oauth: oauthCount.length,
  }
}
