import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import React from 'react'

import { AppHeader } from '@/features/app'
import { AppSidebar } from '@/features/app'
import { auth } from '@/features/auth/lib/auth'
import {
  SidebarInset,
  SidebarProvider,
} from '@/features/shared/components/ui/sidebar'
import { prisma } from '@/features/shared/lib/prisma'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect('/login')
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isAdmin: true, twoFactorEnabled: true },
  })

  const credentialAccount = await prisma.account.findFirst({
    where: { userId: session.user.id, providerId: 'credential' },
    select: { id: true },
  })

  const sidebarUser = {
    id: session.user.id,
    name: session.user.name || 'Benutzer',
    email: session.user.email,
    image: session.user.image,
    twoFactorEnabled: Boolean(dbUser?.twoFactorEnabled),
    hasPassword: !!credentialAccount,
  }

  return (
    <SidebarProvider>
      <AppSidebar user={sidebarUser} isAdmin={dbUser?.isAdmin ?? false} />
      <SidebarInset>
        <AppHeader />
        <div className={'p-3'}>{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
