import React from 'react'

import { LecturerType } from '@/features/lecturers/types'
import { Badge } from '@/features/shared/components/ui/badge'

export function LecturerTypeBadge({ type }: { type: LecturerType }) {
  return (
    <Badge
      className={
        type === 'internal' ? 'bg-chart-2 text-white' : 'bg-chart-1 text-white'
      }>
      {type === 'internal' ? 'Intern' : 'Extern'}
    </Badge>
  )
}
