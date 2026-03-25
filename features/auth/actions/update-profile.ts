'use server'

import { updateTag } from 'next/cache'
import { headers } from 'next/headers'

import { auth } from '@/features/auth/lib/auth'
import type { ProfileActionResult } from '@/features/auth/types'
import { prisma } from '@/features/shared/lib/prisma'
import { publishScopeUpdate } from '@/features/shared/lib/update-stream'

export async function updateProfile(data: {
  name?: string
  email?: string
  image?: string | null
}): Promise<ProfileActionResult> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user?.id) {
      return { error: 'Unauthorized' }
    }

    const name = typeof data.name === 'string' ? data.name.trim() : undefined
    const email = typeof data.email === 'string' ? data.email.trim() : undefined

    let image: string | null | undefined
    if (data.image === null) {
      image = null
    } else if (typeof data.image === 'string') {
      const trimmedImage = data.image.trim()
      image = trimmedImage ? trimmedImage : null
    }

    if (name !== undefined && !name) {
      return { error: 'Invalid name' }
    }
    if (email !== undefined && !email) {
      return { error: 'Invalid email' }
    }

    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (email !== undefined) updateData.email = email
    if (image !== undefined) updateData.image = image

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        twoFactorEnabled: true,
      },
    })

    updateTag('users')
    publishScopeUpdate('users')

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
    console.error('Failed to update profile:', error)
    return { error: 'Failed to update profile' }
  }
}
