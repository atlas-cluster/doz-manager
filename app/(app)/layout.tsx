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

  const sidebarUser = {
    name: session.user.name || 'Benutzer',
    email: session.user.email,
    image: session.user.image,
  }

  return (
    <SidebarProvider>
      <AppSidebar user={sidebarUser} />
      <SidebarInset>
        <AppHeader />
        <div className={'p-3'}>{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
