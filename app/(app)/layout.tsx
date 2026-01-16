import React from 'react'

import { AppSidebar } from '@/features/app'
import { AppHeader } from '@/features/app'
import {
  SidebarInset,
  SidebarProvider,
} from '@/features/shared/components/ui/sidebar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <div className={'p-3'}>{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
