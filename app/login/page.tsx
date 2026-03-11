import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import LoginForm from '@/features/auth/components/login-form'
import { auth } from '@/features/auth/lib/auth'

export default async function LoginPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (session) {
    redirect('/lecturers')
  }

  return <LoginForm />
}
