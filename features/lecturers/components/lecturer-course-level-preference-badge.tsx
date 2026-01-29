import { Check, X } from 'lucide-react'
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
      <Badge variant={hasBachelor ? 'default' : 'secondary'}>
        {hasBachelor ? <Check /> : <X />}
        Bachelor
      </Badge>
      <Badge variant={hasMaster ? 'default' : 'secondary'}>
        {hasMaster ? <Check /> : <X />}
        Master
      </Badge>
    </div>
  )
}
