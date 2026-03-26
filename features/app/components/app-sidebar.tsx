'use client'

import {
  LibraryBigIcon,
  SettingsIcon,
  ChartNoAxesCombinedIcon,
  ShieldUserIcon,
  UsersIcon,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'

import {
  type SidebarUser,
  SidebarUserMenu,
} from '@/features/app/components/sidebar-user-menu'
import { formatRoute } from '@/features/app/utils/format-route'
import type { PublicAuthSettings } from '@/features/auth/types'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/features/shared/components/ui/sidebar'
import { useLiveChanges } from '@/features/shared/hooks/use-live-changes'
import { USER_PROFILE_UPDATED_EVENT } from '@/features/shared/lib/user-profile-sync'

const navItems = [
  { url: '/lecturers', icon: UsersIcon, adminOnly: false },
  { url: '/courses', icon: LibraryBigIcon, adminOnly: false },
  { url: '/reports', icon: ChartNoAxesCombinedIcon, adminOnly: false },
  { url: '/access-control', icon: ShieldUserIcon, adminOnly: true },
  { url: '/settings', icon: SettingsIcon, adminOnly: true },
]

type AppSidebarProps = {
  user: SidebarUser
  isAdmin: boolean
  authSettings: PublicAuthSettings
}

export function AppSidebar({ user, isAdmin, authSettings }: AppSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const suppressUsersRefreshUntilRef = useRef(0)

  useEffect(() => {
    const onOwnProfileMutation = () => {
      suppressUsersRefreshUntilRef.current = Date.now() + 2500
    }

    window.addEventListener(USER_PROFILE_UPDATED_EVENT, onOwnProfileMutation)
    return () => {
      window.removeEventListener(
        USER_PROFILE_UPDATED_EVENT,
        onOwnProfileMutation
      )
    }
  }, [])

  useLiveChanges({
    tags: ['users'],
    onChangeAction: () => {
      if (Date.now() < suppressUsersRefreshUntilRef.current) {
        return
      }
      router.refresh()
    },
  })

  const filteredNavItems = navItems.filter((item) => !item.adminOnly || isAdmin)

  return (
    <Sidebar collapsible={'icon'}>
      <SidebarHeader>
        <div className={'flex items-center overflow-hidden p-1'}>
          <Image
            src={'/logo.png'}
            width={165}
            height={165}
            className={'size-6'}
            alt={'Logo'}
          />
          <h1 className={'ml-2 text-base font-semibold'}>Dozentenverwaltung</h1>
        </div>
      </SidebarHeader>
      <SidebarSeparator className={'m-0'} />
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {filteredNavItems.map((item) => (
              <SidebarMenuItem key={formatRoute(item.url)}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.url}
                  tooltip={formatRoute(item.url)}>
                  <Link href={item.url}>
                    <item.icon />
                    <span>{formatRoute(item.url)}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarSeparator className={'m-0'} />
      <SidebarFooter>
        <SidebarUserMenu user={user} authSettings={authSettings} />
      </SidebarFooter>
    </Sidebar>
  )
}
