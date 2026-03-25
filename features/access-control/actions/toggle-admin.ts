'use server'

import { updateTag } from 'next/cache'
import { headers } from 'next/headers'

import { auth } from '@/features/auth/lib/auth'
import { prisma } from '@/features/shared/lib/prisma'
import { publishScopeUpdate } from '@/features/shared/lib/update-stream'

export async function toggleAdmin(userId: string, isAdmin: boolean) {
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

  if (userId === session.user.id && !isAdmin) {
    throw new Error('Sie können sich nicht selbst die Adminrechte entziehen.')
  }

  await prisma.user.update({
    where: { id: userId },
    data: { isAdmin },
  })

  updateTag('users')
  publishScopeUpdate('users')
}
