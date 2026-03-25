'use server'

import { updateTag } from 'next/cache'
import { headers } from 'next/headers'

import { auth } from '@/features/auth/lib/auth'
import { prisma } from '@/features/shared/lib/prisma'
import { publishScopeUpdate } from '@/features/shared/lib/update-stream'

export async function deleteUsers(ids: string[]) {
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

  if (ids.includes(session.user.id)) {
    throw new Error('Sie können sich nicht selbst löschen.')
  }

  await prisma.user.deleteMany({
    where: {
      id: {
        in: ids,
      },
    },
  })

  updateTag('users')
  publishScopeUpdate('users')
}
