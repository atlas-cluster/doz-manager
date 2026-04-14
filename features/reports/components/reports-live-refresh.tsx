'use client'

import { useRouter } from 'next/navigation'

import { useLiveChanges } from '@/features/shared/hooks/use-live-changes'

export function ReportsLiveRefresh() {
  const router = useRouter()

  useLiveChanges({
    tags: ['lecturers', 'courses'],
    onChangeAction: () => {
      router.refresh()
    },
  })

  return null
}
