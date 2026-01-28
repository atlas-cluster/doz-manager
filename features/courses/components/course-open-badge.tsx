import React from 'react'

import { Badge } from '@/features/shared/components/ui/badge'

export function CourseOpenBadge({ isOpen }: { isOpen: boolean }) {
  return (
    <Badge
      className={isOpen ? 'bg-chart-2 text-white' : 'bg-chart-1 text-white'}>
      {isOpen ? 'Offen' : 'Geschlossen'}
    </Badge>
  )
}
