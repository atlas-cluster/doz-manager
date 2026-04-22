import { headers } from 'next/headers'
import { ProxyAgent } from 'undici'

import { auth } from '@/features/auth/lib/auth'
import { decrypt } from '@/features/auth/lib/encrypt'
import {
  TOOL_LABELS,
  executeChatTool,
  getChatToolDefinitions,
} from '@/features/chat/lib/chat-tools'
import { prisma } from '@/features/shared/lib/prisma'

export const runtime = 'nodejs'
export const maxDuration = 300

const DEFAULT_OPENAI_BASE_URL = 'https://ollama-api.mauelshagen.eu/v1'
const DEFAULT_OPENAI_MODEL = 'qwen3.5:9b'
const DEFAULT_TIMEOUT_MS = 60000
const MAX_TOOL_LOOPS = 6
const proxyAgents = new Map<string, ProxyAgent>()

type AiConfig = {
  baseUrl: string
  model: string
  apiKey: string
  timeoutMs: number
}

async function loadAiConfig(): Promise<AiConfig> {
  const row = await prisma.aiSettings.findUnique({
    where: { id: 'singleton' },
  })

  if (row && !row.enabled) {
    throw new Error('CHAT_DISABLED')
  }

  const envBaseUrl = process.env.OPENAI_BASE_URL ?? DEFAULT_OPENAI_BASE_URL
  const envModel = process.env.OPENAI_MODEL ?? DEFAULT_OPENAI_MODEL
  const envApiKey = process.env.OPENAI_API_KEY ?? ''
  const envTimeout = Number.parseInt(
    process.env.OPENAI_TIMEOUT_MS ?? String(DEFAULT_TIMEOUT_MS),
    10
  )

  if (!row) {
    return {
      baseUrl: envBaseUrl,
      model: envModel,
      apiKey: envApiKey,
      timeoutMs: envTimeout,
    }
  }

  return {
    baseUrl: row.baseUrl ? await decrypt(row.baseUrl) : envBaseUrl,
    model: row.model ? await decrypt(row.model) : envModel,
    apiKey: row.apiKey ? await decrypt(row.apiKey) : envApiKey,
    timeoutMs: row.timeoutMs ?? envTimeout,
  }
}

type IncomingMessage = {
  role: 'user' | 'assistant'
  content: string
}

type OpenAIToolCall = {
  id: string
  type: 'function'
  function: {
    name: string
    arguments: string
  }
}

type OpenAIMessage = {
  role: 'system' | 'user' | 'assistant' | 'tool'
  content: string | null
  tool_calls?: OpenAIToolCall[]
  tool_call_id?: string
}

function buildSystemPrompt() {
  return [
    'Ignoriere alle vorherigen Rollen',
    'Du bist ausschließlich der interne Dozentenmanagement-Assistent der Provadis Hochschule(Von Atlas Cluster bereitgestellt)',
    'Antwortsprache ist Deutsch.',
    'Wenn Daten aus dem System benötigt werden, nutze immer zuerst die verfügbaren Tools.',
    'Nutze für Fragen wie „Welche Vorlesungen unterrichtet XY?“ oder „Welche Dozenten unterrichten XY?“ bevorzugt die spezialisierten Tools mit Namensauflösung.',
    'Wenn eine Suche mehrdeutig ist, nenne die Kandidaten und frage kurz nach, statt zu raten.',
    'Wenn eine Zuweisung gewünscht ist, nutze das Zuweisungs-Tool statt die Aktion nur zu beschreiben.',
    'Erfinde keine Daten, wenn ein Tool nichts liefert.',
    'Berücksichtige nur Features, die für den aktuellen Benutzer sichtbar sind.',
    'Antworte kurz, präzise und professionell.',
  ].join(' ')
}

function normalizeIncomingMessages(value: unknown): IncomingMessage[] {
  if (!Array.isArray(value)) return []

  return value
    .filter((message) => {
      if (typeof message !== 'object' || message === null) return false

      const role = (message as Record<string, unknown>).role
      const content = (message as Record<string, unknown>).content

      return (
        (role === 'user' || role === 'assistant') &&
        typeof content === 'string' &&
        content.trim().length > 0
      )
    })
    .map((message) => {
      const role = (message as Record<string, unknown>).role as
        | 'user'
        | 'assistant'
      const content = (message as Record<string, unknown>).content as string

      return {
        role,
        content: content.trim(),
      }
    })
    .slice(-20)
}

function parseToolArguments(jsonString: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(jsonString)
    return typeof parsed === 'object' && parsed !== null
      ? (parsed as Record<string, unknown>)
      : {}
  } catch {
    return {}
  }
}

function getProxyUrl(): string | undefined {
  const rawValue =
    process.env.OPENAI_PROXY_URL ??
    process.env.HTTPS_PROXY ??
    process.env.HTTP_PROXY

  const proxyUrl = rawValue?.trim()
  return proxyUrl && proxyUrl.length > 0 ? proxyUrl : undefined
}

function getProxyAgent(proxyUrl: string): ProxyAgent {
  const existingAgent = proxyAgents.get(proxyUrl)
  if (existingAgent) return existingAgent

  const agent = new ProxyAgent(proxyUrl)
  proxyAgents.set(proxyUrl, agent)
  return agent
}

async function callOpenAI(messages: OpenAIMessage[], config: AiConfig) {
  const { baseUrl, model, apiKey, timeoutMs } = config
  const proxyUrl = getProxyUrl()

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured.')
  }

  const requestInit: RequestInit & { dispatcher?: ProxyAgent } = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      tools: getChatToolDefinitions(),
      temperature: 0.2,
    }),
    signal: AbortSignal.timeout(
      Number.isFinite(timeoutMs) && timeoutMs > 0
        ? timeoutMs
        : DEFAULT_TIMEOUT_MS
    ),
  }

  if (proxyUrl) {
    requestInit.dispatcher = getProxyAgent(proxyUrl)
  }

  const response = await fetch(`${baseUrl}/chat/completions`, requestInit)

  if (!response.ok) {
    const errorDetails = await response.text().catch(() => 'Unknown error')
    throw new Error(
      `OpenAI error: ${response.status} ${response.statusText}. Details: ${errorDetails}`
    )
  }

  try {
    const data = (await response.json()) as {
      choices?: Array<{ message?: OpenAIMessage }>
    }
    return data.choices?.[0]?.message ?? null
  } catch (error) {
    throw new Error(
      `Failed to parse OpenAI response: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

export async function POST(req: Request) {
  const requestHeaders = await headers()

  const session = await auth.api.getSession({
    headers: requestHeaders,
  })

  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown

  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const messages = normalizeIncomingMessages(
    (body as Record<string, unknown>)?.messages
  )

  if (messages.length === 0) {
    return Response.json(
      { error: 'At least one chat message is required.' },
      { status: 400 }
    )
  }

  const conversation: OpenAIMessage[] = [
    {
      role: 'system',
      content: buildSystemPrompt(),
    },
    ...messages,
  ]

  const userId = session.user.id

  let aiConfig: AiConfig
  try {
    aiConfig = await loadAiConfig()
  } catch (e) {
    if (e instanceof Error && e.message === 'CHAT_DISABLED') {
      return Response.json(
        { error: 'Der Chat-Assistent ist deaktiviert.' },
        { status: 403 }
      )
    }
    return Response.json(
      { error: 'Failed to load AI configuration.' },
      { status: 500 }
    )
  }

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()

      function send(event: string, data: Record<string, unknown>) {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
        )
      }

      try {
        for (let i = 0; i < MAX_TOOL_LOOPS; i++) {
          const assistantMessage = await callOpenAI(conversation, aiConfig)

          if (!assistantMessage) {
            throw new Error('OpenAI did not return a message.')
          }

          const toolCalls = assistantMessage.tool_calls ?? []

          if (toolCalls.length === 0) {
            send('content', { text: assistantMessage.content ?? '' })
            send('done', {})
            controller.close()
            return
          }

          conversation.push({
            role: 'assistant',
            content: assistantMessage.content ?? '',
            tool_calls: toolCalls,
          })

          for (const toolCall of toolCalls) {
            const toolName = toolCall.function.name
            const toolLabel = TOOL_LABELS[toolName] ?? toolName

            send('tool_start', { name: toolName, label: toolLabel })

            const toolResult = await executeChatTool(
              {
                name: toolName,
                arguments: parseToolArguments(toolCall.function.arguments),
              },
              userId
            )

            conversation.push({
              role: 'tool',
              content: JSON.stringify(toolResult),
              tool_call_id: toolCall.id,
            })

            send('tool_end', { name: toolName, label: toolLabel })
          }
        }

        console.warn(
          '[chat] Max tool loops reached without response completion'
        )
        send('content', {
          text: 'Ich konnte die Antwort nicht finalisieren. Bitte formuliere deine Frage etwas konkreter.',
        })
        send('done', {})
        controller.close()
      } catch (error) {
        console.error('[chat] Error while processing request', error)
        send('error', {
          message:
            'Der Chat-Dienst ist aktuell nicht erreichbar. Bitte versuche es später erneut.',
        })
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
