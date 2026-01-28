import React from 'react'

import { LecturerType } from '@/features/lecturers/types'
import { Badge } from '@/features/shared/components/ui/badge'

const lecturerTypeStyles: Record<LecturerType, string> = {
  internal: 'bg-emerald-500/20 border-emerald-500 text-emerald-500',
  external: 'bg-blue-500/20 border-blue-500 text-blue-500',
}

export function LecturerTypeBadge({ type }: { type: LecturerType }) {
  return (
    <Badge variant={'outline'} className={lecturerTypeStyles[type]}>
      {type === 'internal' ? 'Intern' : 'Extern'}
    </Badge>
  )
}
