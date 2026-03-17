'use client'

import { LogOutIcon, SettingsIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { AccountSettings } from '@/features/auth'
import { authClient } from '@/features/auth'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/features/shared/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/features/shared/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/features/shared/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/features/shared/components/ui/sidebar'
import {
  USER_PROFILE_UPDATED_EVENT,
  type UserProfileUpdatedDetail,
} from '@/features/shared/lib/user-profile-sync'

export type SidebarUser = {
  id: string
  name: string
  email: string
  image?: string | null
  twoFactorEnabled: boolean
}

const getInitials = (name: string) => {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')

  return initials || 'U'
}

type SidebarUserMenuProps = {
  user: SidebarUser
}

export function SidebarUserMenu({ user: initialUser }: SidebarUserMenuProps) {
  const router = useRouter()
  const { isMobile } = useSidebar()
  const [user, setUser] = useState<SidebarUser>(initialUser)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isAccountOpen, setIsAccountOpen] = useState(false)

  useEffect(() => {
    const handler = (event: Event) => {
      const { detail } = event as CustomEvent<UserProfileUpdatedDetail>
      if (!detail) return
      if (detail.id !== user.id) return
      setUser((prev) => ({ ...prev, ...detail }))
    }
    window.addEventListener(USER_PROFILE_UPDATED_EVENT, handler)
    return () => window.removeEventListener(USER_PROFILE_UPDATED_EVENT, handler)
  }, [user.id])

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      await authClient.signOut()
      toast.success('Erfolgreich abgemeldet.')
      router.push('/login')
      router.refresh()
    } catch {
      toast.error('Abmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.')
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild suppressHydrationWarning>
              <SidebarMenuButton
                suppressHydrationWarning
                size={'lg'}
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                tooltip={'Konto'}>
                <div className={'flex size-8 items-center justify-center'}>
                  <Avatar>
                    {user.image ? (
                      <AvatarImage src={user.image} alt={user.name} />
                    ) : null}
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {user.email}
                  </span>
                </div>
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              side={isMobile ? 'bottom' : 'right'}
              align="end"
              sideOffset={4}>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar size="sm">
                    {user.image ? (
                      <AvatarImage src={user.image} alt={user.name} />
                    ) : null}
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user.name}</span>
                    <span className="text-muted-foreground truncate text-xs">
                      {user.email}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => setIsAccountOpen(true)}>
                <SettingsIcon />
                {'Konto verwalten'}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleLogout}
                disabled={isLoggingOut}
                variant="destructive">
                <LogOutIcon />
                {'Abmelden'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <Dialog open={isAccountOpen} onOpenChange={setIsAccountOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konto verwalten</DialogTitle>
            <DialogDescription>
              Aktualisieren Sie Ihre Profildaten und 2FA-Einstellungen.
            </DialogDescription>
          </DialogHeader>
          <AccountSettings
            initialUser={{
              id: user.id,
              name: user.name,
              email: user.email,
              image: user.image ?? null,
              twoFactorEnabled: user.twoFactorEnabled,
            }}
            onUserChange={(updated) =>
              setUser((prev) => ({
                ...prev,
                name: updated.name,
                email: updated.email,
                image: updated.image,
                twoFactorEnabled: updated.twoFactorEnabled,
              }))
            }
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
