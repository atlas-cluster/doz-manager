'use server'

import { headers } from 'next/headers'

import { auth } from '@/features/auth/lib/auth'
import { notifyTagsUpdated } from '@/features/shared/lib/cache-notify'
import { prisma } from '@/features/shared/lib/prisma'

export async function deleteUser(id: string) {
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

  if (id === session.user.id) {
    throw new Error('Sie können sich nicht selbst löschen.')
  }

  await prisma.user.delete({
    where: { id },
  })

  await notifyTagsUpdated(['users'], 'access-control:delete-user', [
    { entityType: 'user', entityId: id },
  ])
}
