'use server'

import { updateTag } from 'next/cache'

export async function invalidateUsersCache() {
  updateTag('users')
}
