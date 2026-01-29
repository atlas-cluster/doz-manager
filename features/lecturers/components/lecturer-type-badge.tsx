import { ExternalLink, MapPin } from 'lucide-react'
import React from 'react'

import { LecturerType } from '@/features/lecturers/types'
import { Badge } from '@/features/shared/components/ui/badge'

export function LecturerTypeBadge({ type }: { type: LecturerType }) {
  return (
    <Badge variant={type === 'internal' ? 'default' : 'secondary'}>
      {type === 'internal' ? (
        <>
          <MapPin />
          Intern
        </>
      ) : (
        <>
          <ExternalLink />
          Extern
        </>
      )}
    </Badge>
  )
}
