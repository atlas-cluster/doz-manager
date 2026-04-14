'use client'

import { useEffect, useRef } from 'react'

import type { ChangeEvent } from '@/features/shared/lib/change-events'
import { subscribe } from '@/features/shared/lib/change-stream'
import { getClientConnectionId } from '@/features/shared/lib/connection-id'

type UseLiveChangesOptions = {
  tags?: string[]
  onChangeAction: (event: ChangeEvent) => void
  /**
   * When `true`, events whose `actorConnectionId` matches the current
   * browser tab's connection ID are silently dropped.  This prevents the
   * caller from reacting to its own mutations.
   */
  ignoreOwnChanges?: boolean
}

export function useLiveChanges({
  tags = [],
  onChangeAction,
  ignoreOwnChanges = false,
}: UseLiveChangesOptions) {
  const onChangeRef = useRef(onChangeAction)

  useEffect(() => {
    onChangeRef.current = onChangeAction
  }, [onChangeAction])

  useEffect(() => {
    if (tags.length === 0) {
      return
    }

    const watchedTags = new Set(tags)
    const connectionId = ignoreOwnChanges ? getClientConnectionId() : null

    const unsubscribe = subscribe((event) => {
      if (connectionId && event.actorConnectionId === connectionId) {
        return
      }

      if (!event.tags.some((tag) => watchedTags.has(tag))) {
        return
      }

      onChangeRef.current(event)
    })

    return unsubscribe
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(tags), ignoreOwnChanges])
}
