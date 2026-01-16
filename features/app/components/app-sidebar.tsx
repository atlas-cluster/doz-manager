'use client'

import { HomeIcon, LibraryBigIcon, UsersIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { formatRoute } from '@/features/app/utils/format-route'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/features/shared/components/ui/sidebar'

const navItems = [
  { url: '/dashboard', icon: HomeIcon },
  { url: '/lecturers', icon: UsersIcon },
  { url: '/courses', icon: LibraryBigIcon },
]

export function AppSidebar() {
  const pathname = usePathname()
  return (
    <Sidebar collapsible={'icon'}>
      <SidebarHeader>
        <div className={'flex w-full items-center overflow-hidden p-1'}>
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
            {navItems.map((item) => (
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
    </Sidebar>
  )
}
