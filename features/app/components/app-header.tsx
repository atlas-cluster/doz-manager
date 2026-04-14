'use client'

import { ShieldAlert } from 'lucide-react'
import { usePathname } from 'next/navigation'

import { ThemeToggle } from '@/features/app/components/theme-toggle'
import { formatRoute } from '@/features/app/utils/format-route'
import { Badge } from '@/features/shared/components/ui/badge'
import { Separator } from '@/features/shared/components/ui/separator'
import { SidebarTrigger } from '@/features/shared/components/ui/sidebar'

type AppHeaderProps = {
  isAdmin: boolean
}

export function AppHeader({ isAdmin }: AppHeaderProps) {
  const pathname = usePathname()

  return (
    <div
      className={
        'border-sidebar-border flex h-[49px] w-full items-center border-b px-2'
      }>
      <div className={'mr-auto flex items-center gap-2'}>
        <SidebarTrigger />
        <Separator
          orientation={'vertical'}
          className={'data-[orientation=vertical]:h-6'}
        />
        <h1 className="ml-1 text-base font-semibold">
          {formatRoute(pathname)}
        </h1>
        {isAdmin && (
          <Badge className="flex w-fit items-center gap-1">
            <ShieldAlert className="size-3" />
            Admin
          </Badge>
        )}
      </div>
      <div className={'ml-auto flex items-center gap-2'}>
        <ThemeToggle />
      </div>
    </div>
  )
}
