import { NextRequest } from 'next/server'
import { headers } from 'next/headers'

import { auth } from '@/features/auth/lib/auth'
import {
  isSupportedUpdateScope,
  subscribeToScopeUpdates,
} from '@/features/shared/lib/update-stream'

const RETRY_INTERVAL_MS = 1000

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 })
  }

  const scope = req.nextUrl.searchParams.get('scope')
  if (!scope || !isSupportedUpdateScope(scope)) {
    return new Response('Invalid scope', { status: 400 })
  }

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder()
      let done = false

      const send = (chunk: string) => {
        controller.enqueue(encoder.encode(chunk))
      }

      const unsubscribe = subscribeToScopeUpdates(scope, ({ actorUserId }) => {
        if (done) return
        if (actorUserId && actorUserId === session.user.id) return
        send('event: update\ndata: {}\n\n')
      })

      const keepAlive = setInterval(() => {
        if (done) return
        send(': keepalive\n\n')
      }, 30000)

      req.signal.addEventListener('abort', () => {
        if (done) return
        done = true
        unsubscribe()
        clearInterval(keepAlive)
        controller.close()
      })

      send(`retry: ${RETRY_INTERVAL_MS}\n\n`)
      send(': connected\n\n')
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-store, no-transform',
      Connection: 'keep-alive',
    },
  })
}
