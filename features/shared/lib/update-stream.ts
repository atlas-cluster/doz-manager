export type Scope = 'lecturers' | 'courses' | 'users'

export const UPDATE_CONNECTION_HEADER = 'x-doz-client-connection-id'

export type ListenerPayload = {
  actorConnectionId?: string
}

type Listener = (payload: ListenerPayload) => void

type UpdateStreamState = {
  listenersByScope: Record<Scope, Set<Listener>>
}

const globalUpdateStream = globalThis as typeof globalThis & {
  __dozUpdateStreamState?: UpdateStreamState
}

const state =
  globalUpdateStream.__dozUpdateStreamState ??
  (globalUpdateStream.__dozUpdateStreamState = {
    listenersByScope: {
      lecturers: new Set(),
      courses: new Set(),
      users: new Set(),
    },
  })

const listenersByScope = state.listenersByScope

export function isSupportedUpdateScope(scope: string): scope is Scope {
  return scope === 'lecturers' || scope === 'courses' || scope === 'users'
}

export function subscribeToScopeUpdates(scope: Scope, listener: Listener) {
  listenersByScope[scope].add(listener)

  return () => {
    listenersByScope[scope].delete(listener)
  }
}

export function publishScopeUpdate(scope: Scope) {
  publishScopeUpdateAsync(scope).catch((error) => {
    console.error('Failed to publish scope update', error)
  })
}

async function publishScopeUpdateAsync(scope: Scope) {
  let actorConnectionId: string | undefined

  try {
    const { headers } = await import('next/headers')
    const requestHeaders = await headers()
    actorConnectionId =
      requestHeaders.get(UPDATE_CONNECTION_HEADER) ?? undefined
  } catch {
    actorConnectionId = undefined
  }

  const payload: ListenerPayload = { actorConnectionId }

  for (const listener of listenersByScope[scope]) {
    try {
      listener(payload)
    } catch (error) {
      console.error('Failed to notify update listener', error)
    }
  }
}
