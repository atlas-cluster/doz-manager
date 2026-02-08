import * as React from 'react'

import { Avatar, AvatarFallback } from '@/features/shared/components/ui/avatar'

function initialsFromName(name?: string, maxLetters = 2) {
  if (!name) return '?'

  const parts = name.trim().replace(/\s+/g, ' ').split(' ').filter(Boolean)

  if (parts.length === 0) return '?'

  // Single word: take first 2 letters (e.g., "Jeremy" => "JE")
  if (parts.length === 1) {
    const word = parts[0]
    return Array.from(word).slice(0, maxLetters).join('').toUpperCase()
  }

  // Multiple words: take first char of first + last (e.g., "Jeremy Doe" => "JD")
  const first = Array.from(parts[0])[0] ?? '?'
  const last = Array.from(parts[parts.length - 1])[0] ?? '?'
  return `${first}${last}`.toUpperCase()
}

export function InitialsAvatar(props: { name: string }) {
  const initials = React.useMemo(
    () => initialsFromName(props.name, 3),
    [props.name]
  )

  return (
    <Avatar className={'h-10 w-10'}>
      <AvatarFallback
        className={
          'select-none font-medium uppercase bg-muted text-foreground'
        }>
        {initials}
      </AvatarFallback>
    </Avatar>
  )
}
