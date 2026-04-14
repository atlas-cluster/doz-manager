/**
 * Shared connection-ID utilities.
 *
 * Every browser tab gets a stable, random identifier that is stored in
 * `sessionStorage`.  Server actions receive it via a custom request header
 * so that change-events can carry an `actorConnectionId` and consumers can
 * decide to ignore their own mutations.
 */

export const CONNECTION_ID_HEADER = 'x-doz-client-connection-id'

const STORAGE_KEY = 'doz-client-connection-id'

export function getClientConnectionId(): string | null {
  if (typeof window === 'undefined') {
    return null
  }

  const existing = window.sessionStorage.getItem(STORAGE_KEY)
  if (existing) {
    return existing
  }

  const created =
    window.crypto.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(16).slice(2)}`
  window.sessionStorage.setItem(STORAGE_KEY, created)

  return created
}
