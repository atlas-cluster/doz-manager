'use server'

import { headers } from 'next/headers'

import { auth } from '@/features/auth/lib/auth'
import type { ProfileActionResult } from '@/features/auth/types'
import { prisma } from '@/features/shared/lib/prisma'

export async function getProfile(): Promise<ProfileActionResult> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user?.id) {
      return { error: 'Unauthorized' }
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        twoFactorEnabled: true,
      },
    })

    if (!user) {
      return { error: 'User not found' }
    }

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image ?? null,
        twoFactorEnabled: Boolean(user.twoFactorEnabled),
      },
    }
  } catch (error) {
    console.error('Failed to get profile:', error)
    return { error: 'Failed to get profile' }
  }
}
