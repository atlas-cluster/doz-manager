import React from 'react'

import { Badge } from '@/features/shared/components/ui/badge'

export function CourseOpenBadge({ isOpen }: { isOpen: boolean }) {
  return (
    <Badge
      variant={'outline'}
      className={
        isOpen
          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500'
          : 'bg-neutral-500/20 border-neutral-500 text-neutral-500'
      }>
      {isOpen ? 'Offen' : 'Geschlossen'}
    </Badge>
  )
}
