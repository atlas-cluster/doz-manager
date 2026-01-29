import { Check, Lock } from 'lucide-react'
import React from 'react'

import { Badge } from '@/features/shared/components/ui/badge'

export function CourseOpenBadge({ isOpen }: { isOpen: boolean }) {
  return (
    <Badge variant={isOpen ? 'default' : 'secondary'}>
      {isOpen ? (
        <>
          <Check />
          Offen
        </>
      ) : (
        <>
          <Lock />
          Geschlossen
        </>
      )}
    </Badge>
  )
}
