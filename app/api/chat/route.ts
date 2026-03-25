import { headers } from 'next/headers'

import { auth } from '@/features/auth/lib/auth'
import {
  executeChatTool,
  getChatToolDefinitions,
} from '@/features/chat/lib/chat-tools'
import {
  buildAIServerHeaders,
  extractBearerToken,
  getBearerToken,
} from '@/features/chat/lib/auth'

export const runtime = 'nodejs'

const DEFAULT_OLLAMA_URL = 'http://localhost:11434'
const DEFAULT_OLLAMA_MODEL = 'llama3.1:8b'
const MAX_TOOL_LOOPS = 6

type IncomingMessage = {
  role: 'user' | 'assistant'
  content: string
}

type OllamaMessage = {
  role: 'system' | 'user' | 'assistant' | 'tool'
  content: string
  tool_calls?: Array<{
    function?: {
      name?: string
      arguments?: unknown
    }
  }>
  tool_name?: string
}

function buildSystemPrompt() {
  return [
    'Du bist der interne Dozentenmanagement-Assistent der Provadis Hochschule(Von Atlas Cluster bereitgestellt)',
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

function normalizeToolArguments(value: unknown): Record<string, unknown> {
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      return typeof parsed === 'object' && parsed !== null
        ? (parsed as Record<string, unknown>)
        : {}
    } catch {
      return {}
    }
  }

  return typeof value === 'object' && value !== null
    ? (value as Record<string, unknown>)
    : {}
}

async function callOllama(messages: OllamaMessage[], bearerToken?: string) {
  const ollamaUrl = process.env.OLLAMA_URL ?? DEFAULT_OLLAMA_URL
  const model = process.env.OLLAMA_MODEL ?? DEFAULT_OLLAMA_MODEL

  const response = await fetch(`${ollamaUrl}/api/chat`, {
    method: 'POST',
    headers: buildAIServerHeaders(bearerToken),
    body: JSON.stringify({
      model,
      stream: false,
      messages,
      tools: getChatToolDefinitions(),
      options: {
        temperature: 0.2,
      },
    }),
    // Increase timeout for remote servers (default is 10s)
    signal: AbortSignal.timeout(30000),
  })

  if (!response.ok) {
    const errorDetails = await response.text().catch(() => 'Unknown error')
    throw new Error(
      `Ollama error: ${response.status} ${response.statusText}. Details: ${errorDetails}`
    )
  }

  try {
    return (await response.json()) as {
      message?: OllamaMessage
    }
  } catch (error) {
    throw new Error(
      `Failed to parse Ollama response: ${error instanceof Error ? error.message : 'Unknown error'}`
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

  // Extract optional bearer token: from request headers first, then fall back to environment variable
  const headerToken = extractBearerToken(requestHeaders)
  const bearerToken = getBearerToken(headerToken)

  const conversation: OllamaMessage[] = [
    {
      role: 'system',
      content: buildSystemPrompt(),
    },
    ...messages,
  ]

  try {
    for (let i = 0; i < MAX_TOOL_LOOPS; i++) {
      const ollamaResponse = await callOllama(conversation, bearerToken)
      const assistantMessage = ollamaResponse.message

      if (!assistantMessage) {
        throw new Error('Ollama did not return a message.')
      }

      const toolCalls = assistantMessage.tool_calls ?? []

      if (toolCalls.length === 0) {
        return Response.json({
          message: assistantMessage.content,
        })
      }

      conversation.push({
        role: 'assistant',
        content: assistantMessage.content ?? '',
        tool_calls: toolCalls,
      })

      for (const toolCall of toolCalls) {
        const toolName = toolCall.function?.name

        if (!toolName) {
          continue
        }

        const toolResult = await executeChatTool(
          {
            name: toolName,
            arguments: normalizeToolArguments(toolCall.function?.arguments),
          },
          session.user.id
        )

        conversation.push({
          role: 'tool',
          content: JSON.stringify(toolResult),
          tool_name: toolName,
        })
      }
    }
    console.warn('[chat] Max tool loops reached without response completion')

    return Response.json({
      message:
        'Ich konnte die Antwort nicht finalisieren. Bitte formuliere deine Frage etwas konkreter.',
    })
  } catch (error) {
    console.error('[chat] Error while processing request', error)

    return Response.json(
      {
        error:
          'Der Chat-Dienst ist aktuell nicht erreichbar. Bitte prüfe, ob Ollama läuft.',
      },
      { status: 500 }
    )
  }
}
