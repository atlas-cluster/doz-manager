'use client'

import {
  ChartNoAxesCombinedIcon,
  LibraryBigIcon,
  ShieldUserIcon, UsersIcon,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import {
  type SidebarUser,
  SidebarUserMenu,
} from '@/features/app/components/sidebar-user-menu'
import { formatRoute } from '@/features/app/utils/format-route'
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

const navItems = [
  { url: '/lecturers', icon: UsersIcon, adminOnly: false },
  { url: '/courses', icon: LibraryBigIcon, adminOnly: false },
  { url: '/reports', icon: ChartNoAxesCombinedIcon, adminOnly: false },
  { url: '/access-control', icon: ShieldUserIcon, adminOnly: true },
]

type AppSidebarProps = {
  user: SidebarUser
  isAdmin: boolean
}

export function AppSidebar({ user, isAdmin }: AppSidebarProps) {
  const pathname = usePathname()

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
        <SidebarUserMenu user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
