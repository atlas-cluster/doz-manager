export type ChangeEvent = {
  type: 'tags-updated'
  tags: string[]
  timestamp: number
  source?: string
  actorConnectionId?: string
  entities?: Array<{
    entityType: 'course' | 'lecturer' | 'user'
    entityId: string
  }>
}

const DEFAULT_CHANNEL = 'app:changes'

type RedisClient = {
  isOpen?: boolean
  connect: () => Promise<unknown>
  publish: (channel: string, message: string) => Promise<unknown>
  subscribe: (
    channel: string,
    listener: (message: string) => void
  ) => Promise<unknown>
  unsubscribe: (
    channel: string,
    listener?: (message: string) => void
  ) => Promise<unknown>
  quit: () => Promise<unknown>
  on: (event: 'error', listener: (error: unknown) => void) => void
}

let publisherPromise: Promise<RedisClient | null> | null = null

function getRedisUrl() {
  return process.env.REDIS_URL?.trim()
}

export function getChangesChannel() {
  return process.env.CHANGE_EVENTS_CHANNEL?.trim() || DEFAULT_CHANNEL
}

async function createRedisClient(): Promise<RedisClient | null> {
  const redisUrl = getRedisUrl()
  if (!redisUrl) {
    return null
  }

  const redis = (await import('redis')) as unknown as {
    createClient: (args: { url: string }) => RedisClient
  }

  const client = redis.createClient({ url: redisUrl })
  client.on('error', (error) => {
    console.warn('[changes] Redis client error:', error)
  })

  if (!client.isOpen) {
    await client.connect()
  }

  return client
}

async function getPublisher(): Promise<RedisClient | null> {
  if (!publisherPromise) {
    publisherPromise = createRedisClient().catch((error) => {
      publisherPromise = null
      console.warn('[changes] Failed to initialize Redis publisher:', error)
      return null
    })
  }

  return publisherPromise
}

export async function publishChange(event: Omit<ChangeEvent, 'timestamp'>) {
  const publisher = await getPublisher()
  if (!publisher) {
    return
  }

  const payload: ChangeEvent = {
    ...event,
    timestamp: Date.now(),
  }

  try {
    await publisher.publish(getChangesChannel(), JSON.stringify(payload))
  } catch (error) {
    console.warn('[changes] Failed to publish change event:', error)
  }
}

export async function subscribeChanges(
  onMessage: (event: ChangeEvent) => void
): Promise<() => Promise<void>> {
  const subscriber = await createRedisClient()
  if (!subscriber) {
    return async () => {}
  }

  const listener = (message: string) => {
    try {
      const parsed = JSON.parse(message) as ChangeEvent
      if (parsed?.type !== 'tags-updated' || !Array.isArray(parsed.tags)) {
        return
      }
      onMessage(parsed)
    } catch {
      // Ignore malformed messages from other publishers.
    }
  }

  await subscriber.subscribe(getChangesChannel(), listener)

  return async () => {
    try {
      await subscriber.unsubscribe(getChangesChannel(), listener)
    } catch {
      // Swallow unsubscribe issues during shutdown.
    }
    try {
      await subscriber.quit()
    } catch {
      // Ignore quit errors on already-closed connections.
    }
  }
}
