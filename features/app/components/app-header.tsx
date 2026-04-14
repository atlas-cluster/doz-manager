'use client'

import { ShieldAlert } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

import { ThemeToggle } from '@/features/app/components/theme-toggle'
import { formatRoute } from '@/features/app/utils/format-route'
import { Badge } from '@/features/shared/components/ui/badge'
import { Separator } from '@/features/shared/components/ui/separator'
import { SidebarTrigger } from '@/features/shared/components/ui/sidebar'
import {
  CONNECTION_ID_HEADER,
  getClientConnectionId,
} from '@/features/shared/lib/connection-id'

type AppHeaderProps = {
  isAdmin: boolean
}

export function AppHeader({ isAdmin }: AppHeaderProps) {
  const pathname = usePathname()
  const [connectionId, setConnectionId] = useState<string | null>(null)

  useEffect(() => {
    setConnectionId(getClientConnectionId())
  }, [])

  // Intercept fetch to attach the connection ID header to mutations so
  // that server actions can propagate it inside change events.
  useEffect(() => {
    if (!connectionId) return

    const originalFetch = window.fetch.bind(window)

    window.fetch = ((input, init) => {
      const request = input instanceof Request ? input : null
      const requestMethod = (
        init?.method ??
        request?.method ??
        'GET'
      ).toUpperCase()

      if (requestMethod === 'GET' || requestMethod === 'HEAD') {
        return originalFetch(input, init)
      }

      const target =
        typeof input === 'string' || input instanceof URL ? input : input.url
      let targetUrl: URL
      try {
        targetUrl = new URL(target, window.location.origin)
      } catch {
        return originalFetch(input, init)
      }

      if (targetUrl.origin !== window.location.origin) {
        return originalFetch(input, init)
      }

      const headers = new Headers(request?.headers)
      new Headers(init?.headers).forEach((value, key) => {
        headers.set(key, value)
      })
      headers.set(CONNECTION_ID_HEADER, connectionId)

      return originalFetch(input, {
        ...init,
        headers,
      })
    }) as typeof window.fetch

    return () => {
      window.fetch = originalFetch
    }
  }, [connectionId])

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
