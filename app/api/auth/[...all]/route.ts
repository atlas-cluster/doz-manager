import { revalidateTag } from 'next/cache'

import { auth, ensureAuthInitialized } from '@/features/auth/lib/auth'

export async function GET(req: Request) {
  await ensureAuthInitialized()
  const response = await auth.handler(req)

  // After an OAuth callback completes (account linked/created),
  // invalidate the users cache so the access-control table reflects
  // newly linked auth methods immediately.
  const path = new URL(req.url).pathname
  if (path.includes('/callback/')) {
    revalidateTag('users', { expire: 0 })
  }

  return response
}

export async function POST(req: Request) {
  await ensureAuthInitialized()
  return auth.handler(req)
}
