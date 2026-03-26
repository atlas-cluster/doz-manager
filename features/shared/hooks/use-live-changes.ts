'use client'

import { useEffect, useRef } from 'react'

import type { ChangeEvent } from '@/features/shared/lib/change-events'

type UseLiveChangesOptions = {
  tags?: string[]
  onChangeAction: (event: ChangeEvent) => void
}

export function useLiveChanges({
  tags = [],
  onChangeAction,
}: UseLiveChangesOptions) {
  const onChangeRef = useRef(onChangeAction)

  useEffect(() => {
    onChangeRef.current = onChangeAction
  }, [onChangeAction])

  useEffect(() => {
    if (typeof window === 'undefined' || typeof EventSource === 'undefined') {
      return
    }

    const watchedTags = new Set(tags)
    const stream = new EventSource('/api/changes')

    stream.onmessage = (message) => {
      try {
        const event = JSON.parse(message.data) as ChangeEvent
        const shouldHandle =
          watchedTags.size === 0 ||
          event.tags.some((tag) => watchedTags.has(tag))

        if (shouldHandle) {
          onChangeRef.current(event)
        }
      } catch {
        // Ignore malformed events and keep the stream alive.
      }
    }

    return () => {
      stream.close()
    }
  }, [tags.join('|')])
}
