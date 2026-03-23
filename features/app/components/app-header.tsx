'use client'

import { RefreshCwIcon } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'

import { ThemeToggle } from '@/features/app/components/theme-toggle'
import { formatRoute } from '@/features/app/utils/format-route'
import { Button } from '@/features/shared/components/ui/button'
import { Separator } from '@/features/shared/components/ui/separator'
import type { Scope } from '@/features/shared/lib/update-stream'
import { cn } from '@/features/shared/lib/utils'
import { SidebarTrigger } from '@/features/shared/components/ui/sidebar'

const REFRESH_FEEDBACK_DELAY_MS = 380
const EXIT_ANIMATION_DELAY_MS = 180

export function AppHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const [hasUpdates, setHasUpdates] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
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
    if (scopes.length === 0) {
      setHasUpdates(false)
      setIsRefreshing(false)
      setIsExiting(false)
      return
    }

    setHasUpdates(false)

    const onUpdate = () => setHasUpdates(true)
    const sources = scopes.map(
      (scope) =>
        new EventSource(
          `/api/updates/stream?scope=${encodeURIComponent(scope)}`
        )
    )

    for (const source of sources) {
      source.addEventListener('update', onUpdate)
    }

    return () => {
      for (const source of sources) {
        source.removeEventListener('update', onUpdate)
        source.close()
      }
    }
  }, [scopes])

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
            variant="outline"
            size="xs"
            type="button"
            disabled={isRefreshing}
            className={cn(
              'border-orange-400 bg-orange-100 text-orange-900 transition-all duration-200 hover:bg-orange-200 dark:border-orange-500 dark:bg-orange-950 dark:text-orange-100 dark:hover:bg-orange-900',
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
