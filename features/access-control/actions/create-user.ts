'use server'

import { updateTag } from 'next/cache'
import { headers } from 'next/headers'
import { z } from 'zod'

import { userSchema } from '@/features/access-control/schemas/user'
import { auth } from '@/features/auth/lib/auth'
import { prisma } from '@/features/shared/lib/prisma'

export async function createUser(data: z.infer<typeof userSchema>) {
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

  if (!data.password) {
    throw new Error('Passwort ist beim Erstellen erforderlich')
  }

  await auth.api.signUpEmail({
    body: {
      email: data.email,
      password: data.password,
      name: data.name,
    },
  })

  updateTag('users')
}
