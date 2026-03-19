'use server'

import { headers } from 'next/headers'

import { auth } from '@/features/auth/lib/auth'

export async function getBackupCodeCount(): Promise<number | null> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user?.id) {
      return null
    }

    const result = await auth.api.viewBackupCodes({
      body: { userId: session.user.id },
      headers: await headers(),
    })

    return result?.backupCodes?.length ?? null
  } catch {
    return null
  }
}
