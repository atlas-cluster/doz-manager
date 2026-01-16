'use client'

import { ContrastIcon, MoonIcon, SunIcon } from 'lucide-react'
import { useTheme } from 'next-themes'
import * as React from 'react'

import { Button } from '@/features/shared/components/ui/button'

type Theme = 'light' | 'dark' | 'system'

const NEXT_THEME: Record<Theme, Theme> = {
  light: 'system',
  system: 'dark',
  dark: 'light',
}

const IconSwitcher = React.memo(function IconSwitcher({
  theme,
  baseClass,
}: {
  theme: Theme
  baseClass: string
}) {
  return (
    <span className="relative inline-flex h-5 w-5">
      <SunIcon
        aria-hidden
        className={
          baseClass +
          (theme === 'light'
            ? ' opacity-100'
            : ' pointer-events-none opacity-0')
        }
      />
      <MoonIcon
        aria-hidden
        className={
          baseClass +
          (theme === 'dark' ? ' opacity-100' : ' pointer-events-none opacity-0')
        }
      />
      <ContrastIcon
        aria-hidden
        className={
          baseClass +
          (theme === 'system'
            ? ' opacity-100'
            : ' pointer-events-none opacity-0')
        }
      />
    </span>
  )
})

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()

  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  const currentTheme = (theme ?? resolvedTheme ?? 'system') as Theme

  const toggleTheme = React.useCallback(() => {
    const next = NEXT_THEME[currentTheme]
    setTheme(next)
  }, [currentTheme, setTheme])

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={mounted ? toggleTheme : undefined}
      aria-label="Toggle theme">
      {mounted && (
        <IconSwitcher
          theme={currentTheme}
          baseClass="absolute inset-0 m-auto transition-opacity duration-200 ease-in-out motion-reduce:transition-none"
        />
      )}
    </Button>
  )
}
