import React from 'react'

import { CourseLevelPreference } from '@/features/lecturers/types'
import { Badge } from '@/features/shared/components/ui/badge'

export function LecturerCourseLevelPreferenceBadge({
  pref,
}: {
  pref: CourseLevelPreference
}) {
  const hasBachelor = pref === 'bachelor' || pref === 'both'
  const hasMaster = pref === 'master' || pref === 'both'
  return (
    <div className={'flex gap-2'}>
      {hasBachelor && (
        <Badge className={'bg-chart-2 text-white'}>Bachelor</Badge>
      )}
      {hasMaster && <Badge className={'bg-chart-1 text-white'}>Master</Badge>}
    </div>
  )
}
