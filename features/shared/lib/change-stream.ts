'use client'

/**
 * Shared EventSource singleton for `/api/changes`.
 *
 * Instead of every `useLiveChanges` consumer opening its own EventSource,
 * all of them share a single SSE connection through this module.  The
 * connection is established lazily when the first listener subscribes and
 * torn down when the last one unsubscribes.
 */

import type { ChangeEvent } from '@/features/shared/lib/change-events'

type Listener = (event: ChangeEvent) => void

const RECONNECT_DELAY_MS = 5_000

let source: EventSource | null = null
let reconnectTimer: ReturnType<typeof setTimeout> | null = null
const listeners = new Set<Listener>()

function dispatch(event: ChangeEvent) {
  for (const listener of listeners) {
    try {
      listener(event)
    } catch {
      // Don't let one listener crash the others.
    }
  }
}

function connect() {
  if (source) return
  if (typeof window === 'undefined' || typeof EventSource === 'undefined') {
    return
  }

  const es = new EventSource('/api/changes')

  es.onmessage = (message) => {
    try {
      const event = JSON.parse(message.data) as ChangeEvent
      if (event?.type === 'tags-updated' && Array.isArray(event.tags)) {
        dispatch(event)
      }
    } catch {
      // Ignore malformed events.
    }
  }

  es.onerror = () => {
    // EventSource auto-reconnects on transient network errors.  However, if
    // the server returned a non-200 status (e.g. 401 after session expiry)
    // the readyState transitions to CLOSED and auto-reconnect stops.  In
    // that case we schedule a manual retry so the stream recovers once the
    // session is refreshed.
    if (es.readyState === EventSource.CLOSED) {
      source = null

      if (listeners.size > 0 && !reconnectTimer) {
        reconnectTimer = setTimeout(() => {
          reconnectTimer = null
          if (listeners.size > 0) {
            connect()
          }
        }, RECONNECT_DELAY_MS)
      }
    }
  }

  source = es
}

function disconnect() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }
  if (source) {
    source.close()
    source = null
  }
}

/**
 * Subscribe to raw change events from the shared SSE connection.
 *
 * Returns an unsubscribe function.  The connection is established lazily on
 * the first subscriber and closed when the last subscriber leaves.
 */
export function subscribe(listener: Listener): () => void {
  listeners.add(listener)
  connect()

  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) {
      disconnect()
    }
  }
}
