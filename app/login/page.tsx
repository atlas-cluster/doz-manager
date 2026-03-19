import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'

import { getPublicAuthSettings } from '@/features/auth/actions/get-public-auth-settings'
import LoginForm from '@/features/auth/components/login-form'
import { auth } from '@/features/auth/lib/auth'

export default async function LoginPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (session) {
    redirect('/lecturers')
  }

  const authSettings = await getPublicAuthSettings()

  return (
    <Suspense>
      <LoginForm enabledMethods={authSettings} />
    </Suspense>
  )
}
