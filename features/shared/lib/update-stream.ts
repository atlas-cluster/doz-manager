export type Scope = 'lecturers' | 'courses' | 'users'

export type ListenerPayload = {
  actorUserId?: string
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
  let actorUserId: string | undefined

  try {
    const [{ headers }, { auth }] = await Promise.all([
      import('next/headers'),
      import('@/features/auth/lib/auth'),
    ])
    const session = await auth.api.getSession({
      headers: await headers(),
    })
    actorUserId = session?.user?.id
  } catch {
    actorUserId = undefined
  }

  const payload: ListenerPayload = { actorUserId }

  for (const listener of listenersByScope[scope]) {
    try {
      listener(payload)
    } catch (error) {
      console.error('Failed to notify update listener', error)
    }
  }
}
