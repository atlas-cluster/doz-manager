import { subscribeChanges } from '@/features/shared/lib/change-events'

export const runtime = 'nodejs'

function toSsePayload(payload: string) {
  return `data: ${payload}\n\n`
}

export async function GET(request: Request) {
  const encoder = new TextEncoder()

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      let isClosed = false

      const write = (chunk: string) => {
        if (isClosed) return
        controller.enqueue(encoder.encode(chunk))
      }

      write(': connected\n\n')

      const heartbeat = setInterval(() => {
        write(': keepalive\n\n')
      }, 20_000)

      let unsubscribe: (() => Promise<void>) | null = null

      void (async () => {
        unsubscribe = await subscribeChanges((event) => {
          write(toSsePayload(JSON.stringify(event)))
        })
      })()

      const shutdown = async () => {
        if (isClosed) return
        isClosed = true
        clearInterval(heartbeat)
        if (unsubscribe) {
          await unsubscribe()
        }
        controller.close()
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
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
