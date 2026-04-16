'use server'

import { createId } from '@paralleldrive/cuid2'
import { headers } from 'next/headers'
import { z } from 'zod'

import { userSchema } from '@/features/access-control/schemas/user'
import { auth } from '@/features/auth/lib/auth'
import { notifyTagsUpdated } from '@/features/shared/lib/cache-notify'
import { runInTransaction } from '@/features/shared/lib/transaction'

export async function createUser(data: z.infer<typeof userSchema>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user?.id) {
    throw new Error('Nicht authentifiziert')
  }

  if (data.password) {
    await runInTransaction(async (tx) => {
      const caller = await tx.user.findUnique({
        where: { id: session.user.id },
        select: { isAdmin: true },
      })

      if (!caller?.isAdmin) {
        throw new Error('Keine Berechtigung')
      }

      // Check if user already exists
      const existing = await tx.user.findUnique({
        where: { email: data.email },
      })

      if (existing) {
        throw new Error('Ein Benutzer mit dieser E-Mail existiert bereits.')
      }
    })

    // Create user with credential (password) via BetterAuth
    await auth.api.signUpEmail({
      body: {
        email: data.email,
        password: data.password,
        name: data.name,
      },
    })
  } else {
    // Create user record without password — social providers will
    // link automatically when the user logs in (matched by email).
    await runInTransaction(async (tx) => {
      const caller = await tx.user.findUnique({
        where: { id: session.user.id },
        select: { isAdmin: true },
      })

      if (!caller?.isAdmin) {
        throw new Error('Keine Berechtigung')
      }

      // Check if user already exists
      const existing = await tx.user.findUnique({
        where: { email: data.email },
      })

      if (existing) {
        throw new Error('Ein Benutzer mit dieser E-Mail existiert bereits.')
      }

      await tx.user.create({
        data: {
          id: createId(),
          name: data.name,
          email: data.email,
          emailVerified: true,
          image: data.image || null,
        },
      })
    })
  }

  await notifyTagsUpdated(['users'], 'access-control:create-user')
}
