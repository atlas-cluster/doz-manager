import React from 'react'

import { CourseLevelPreference } from '@/features/lecturers/types'
import { Badge } from '@/features/shared/components/ui/badge'

const courseLevelPreferenceStyles: Record<CourseLevelPreference, string> = {
  bachelor: 'bg-yellow-500/20 border-yellow-500 text-yellow-500',
  master: 'bg-red-500/20 border-red-500 text-red-500',
  both: 'bg-orange-500/20 border-orange-500 text-orange-500',
}

export function LecturerCourseLevelPreferenceBadge({
  pref,
}: {
  pref: CourseLevelPreference
}) {
  return (
    <Badge variant={'outline'} className={courseLevelPreferenceStyles[pref]}>
      {pref === 'bachelor'
        ? 'Bachelor'
        : pref === 'master'
          ? 'Master'
          : 'Bachelor & Master'}
    </Badge>
  )
}
