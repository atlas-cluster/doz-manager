'use server'

import { notifyTagsUpdated } from '@/features/shared/lib/cache-notify'

export async function invalidateUsersCache(userId?: string) {
  await notifyTagsUpdated(
    ['users'],
    'access-control:invalidate-users-cache',
    userId ? [{ entityType: 'user', entityId: userId }] : undefined
  )
}
