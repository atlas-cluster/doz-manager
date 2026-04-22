'use server'

import { headers } from 'next/headers'

import { auth } from '@/features/auth/lib/auth'
import { decrypt } from '@/features/auth/lib/encrypt'
import type { AiConnectionTestResult } from '@/features/chat/types'
import { prisma } from '@/features/shared/lib/prisma'

type TestAiConnectionInput = {
  baseUrl: string
  apiKey: string
  model: string
}

async function resolveApiKey(providedKey: string): Promise<string> {
  if (providedKey && providedKey !== '__use_existing__') {
    return providedKey
  }

  const row = await prisma.aiSettings.findUnique({
    where: { id: 'singleton' },
    select: { apiKey: true },
  })

  if (row?.apiKey) {
    return await decrypt(row.apiKey)
  }

  return process.env.OPENAI_API_KEY ?? ''
}

export async function testAiConnection(
  data: TestAiConnectionInput
): Promise<AiConnectionTestResult> {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user?.id) {
    throw new Error('Nicht authentifiziert')
  }

  const caller = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isAdmin: true },
  })

  if (!caller?.isAdmin) {
    throw new Error('Keine Berechtigung')
  }

  const { baseUrl, model } = data
  const apiKey = await resolveApiKey(data.apiKey)

  if (!baseUrl || !apiKey || !model) {
    return {
      success: false,
      latencyMs: 0,
      error: 'Base URL, API Key und Modell sind erforderlich.',
    }
  }

  const start = performance.now()

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'user', content: 'Say "Hello World" and nothing else.' },
        ],
        temperature: 0,
        max_tokens: 50,
      }),
      signal: AbortSignal.timeout(30000),
    })

    const latencyMs = Math.round(performance.now() - start)

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unbekannter Fehler')
      return {
        success: false,
        latencyMs,
        error: `Server antwortete mit ${response.status}: ${errorText.slice(0, 200)}`,
      }
    }

    const result = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>
      model?: string
      usage?: {
        completion_tokens?: number
        prompt_tokens?: number
        total_tokens?: number
      }
    }

    const completionTokens = result.usage?.completion_tokens ?? 0
    const promptTokens = result.usage?.prompt_tokens ?? 0
    const totalTokens = result.usage?.total_tokens ?? 0
    const tokensPerSecond =
      completionTokens > 0 && latencyMs > 0
        ? Math.round((completionTokens / (latencyMs / 1000)) * 100) / 100
        : undefined

    const responseText =
      result.choices?.[0]?.message?.content?.trim() ?? undefined

    return {
      success: true,
      latencyMs,
      tokensPerSecond,
      totalTokens: totalTokens > 0 ? totalTokens : undefined,
      completionTokens: completionTokens > 0 ? completionTokens : undefined,
      promptTokens: promptTokens > 0 ? promptTokens : undefined,
      modelInfo: result.model ?? model,
      responseText,
    }
  } catch (error) {
    const latencyMs = Math.round(performance.now() - start)

    const message =
      error instanceof Error
        ? error.name === 'TimeoutError'
          ? 'Verbindungs-Timeout nach 30 Sekunden.'
          : error.message
        : 'Unbekannter Fehler'

    return {
      success: false,
      latencyMs,
      error: message,
    }
  }
}
