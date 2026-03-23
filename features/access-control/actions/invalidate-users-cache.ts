'use server'

import { updateTag } from 'next/cache'
import { publishScopeUpdate } from '@/features/shared/lib/update-stream'

export async function invalidateUsersCache() {
  updateTag('users')
  publishScopeUpdate('users')
}
