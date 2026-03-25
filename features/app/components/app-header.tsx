'use client'

import { RefreshCwIcon } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'

import { ThemeToggle } from '@/features/app/components/theme-toggle'
import { formatRoute } from '@/features/app/utils/format-route'
import { Button } from '@/features/shared/components/ui/button'
import { Separator } from '@/features/shared/components/ui/separator'
import type { Scope } from '@/features/shared/lib/update-stream'
import { UPDATE_CONNECTION_HEADER } from '@/features/shared/lib/update-stream'
import { cn } from '@/features/shared/lib/utils'
import { SidebarTrigger } from '@/features/shared/components/ui/sidebar'

const REFRESH_FEEDBACK_DELAY_MS = 380
const EXIT_ANIMATION_DELAY_MS = 180
const CLIENT_CONNECTION_ID_STORAGE_KEY = 'doz-client-connection-id'

function getClientConnectionId() {
  if (typeof window === 'undefined') {
    return null
  }

  const existingConnectionId = window.sessionStorage.getItem(
    CLIENT_CONNECTION_ID_STORAGE_KEY
  )
  if (existingConnectionId) {
    return existingConnectionId
  }

  const createdConnectionId =
    window.crypto.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(16).slice(2)}`
  window.sessionStorage.setItem(
    CLIENT_CONNECTION_ID_STORAGE_KEY,
    createdConnectionId
  )

  return createdConnectionId
}

export function AppHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const [hasUpdates, setHasUpdates] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const [connectionId, setConnectionId] = useState<string | null>(null)
  const refreshFeedbackTimerRef = useRef<number | null>(null)
  const exitTimerRef = useRef<number | null>(null)
  const scopes = useMemo<Array<Scope>>(() => {
    if (pathname === '/lecturers') return ['lecturers']
    if (pathname === '/courses') return ['courses']
    if (pathname === '/access-control' || pathname === '/settings')
      return ['users']
    if (pathname === '/reports') return ['lecturers', 'courses']
    return []
  }, [pathname])

  useEffect(() => {
    setConnectionId(getClientConnectionId())
  }, [])

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
      headers.set(UPDATE_CONNECTION_HEADER, connectionId)

      return originalFetch(input, {
        ...init,
        headers,
      })
    }) as typeof window.fetch

    return () => {
      window.fetch = originalFetch
    }
  }, [connectionId])

  useEffect(() => {
    if (!connectionId) {
      setHasUpdates(false)
      return
    }

    if (scopes.length === 0) {
      setHasUpdates(false)
      setIsRefreshing(false)
      setIsExiting(false)
      return
    }

    setHasUpdates(false)

    const onUpdate = () => setHasUpdates(true)
    const sources = scopes.map((scope) => {
      const searchParams = new URLSearchParams({
        scope,
        connectionId,
      })
      return new EventSource(`/api/updates/stream?${searchParams.toString()}`)
    })

    for (const source of sources) {
      source.addEventListener('update', onUpdate)
    }

    return () => {
      for (const source of sources) {
        source.removeEventListener('update', onUpdate)
        source.close()
      }
    }
  }, [connectionId, scopes])

  useEffect(() => {
    return () => {
      if (refreshFeedbackTimerRef.current) {
        window.clearTimeout(refreshFeedbackTimerRef.current)
      }
      if (exitTimerRef.current) {
        window.clearTimeout(exitTimerRef.current)
      }
    }
  }, [])

  const showRefreshButton =
    (hasUpdates || isRefreshing || isExiting) && scopes.length > 0

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
        {showRefreshButton ? (
          <Button
            size="xs"
            type="button"
            disabled={isRefreshing}
            className={cn(
              'transition-all duration-200',
              isExiting ? 'animate-out fade-out-0 zoom-out-95' : '',
              isRefreshing
                ? 'scale-95 opacity-90'
                : 'animate-in fade-in-0 zoom-in-95'
            )}
            onClick={() => {
              if (isRefreshing) return
              setIsRefreshing(true)
              router.refresh()

              refreshFeedbackTimerRef.current = window.setTimeout(() => {
                setIsRefreshing(false)
                setIsExiting(true)
                exitTimerRef.current = window.setTimeout(() => {
                  setIsExiting(false)
                  setHasUpdates(false)
                  window.location.reload()
                }, EXIT_ANIMATION_DELAY_MS)
              }, REFRESH_FEEDBACK_DELAY_MS)
            }}>
            <RefreshCwIcon className={isRefreshing ? 'animate-spin' : ''} />
            Aktualisieren
          </Button>
        ) : null}
      </div>
      <div className={'ml-auto flex items-center gap-2'}>
        <ThemeToggle />
      </div>
    </div>
  )
}
