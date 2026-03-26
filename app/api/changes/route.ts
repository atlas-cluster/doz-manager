import { headers } from 'next/headers'

import { auth } from '@/features/auth/lib/auth'
import { subscribeChanges } from '@/features/shared/lib/change-events'

export const runtime = 'nodejs'

const KEEPALIVE_INTERVAL_MS = 30_000
const RETRY_INTERVAL_MS = 1_000

function toSsePayload(payload: string) {
  return `data: ${payload}\n\n`
}

export async function GET(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 })
  }

  let unsubscribePromise: Promise<() => Promise<void>> | null = null
  let isClosed = false

  const encoder = new TextEncoder()

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const write = (chunk: string) => {
        if (isClosed) return
        try {
          controller.enqueue(encoder.encode(chunk))
        } catch {
          // Stream may have been closed between the guard and the write.
        }
      }

      write(`retry: ${RETRY_INTERVAL_MS}\n\n`)
      write(': connected\n\n')

      const heartbeat = setInterval(() => {
        write(': keepalive\n\n')
      }, KEEPALIVE_INTERVAL_MS)

      unsubscribePromise = subscribeChanges((event) => {
        write(toSsePayload(JSON.stringify(event)))
      })

      const shutdown = async () => {
        if (isClosed) return
        isClosed = true
        clearInterval(heartbeat)
        try {
          const unsubscribe = await unsubscribePromise
          if (unsubscribe) await unsubscribe()
        } catch {
          // Ignore cleanup errors during shutdown.
        }
        try {
          controller.close()
        } catch {
          // Already closed.
        }
      }

      request.signal.addEventListener('abort', () => {
        void shutdown()
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
    },
  })
}
