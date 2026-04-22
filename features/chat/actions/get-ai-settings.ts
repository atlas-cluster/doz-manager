'use server'

import { headers } from 'next/headers'

import { auth } from '@/features/auth/lib/auth'
import { decrypt } from '@/features/auth/lib/encrypt'
import type { AiSettingsData } from '@/features/chat/types'
import { prisma } from '@/features/shared/lib/prisma'

const DEFAULT_BASE_URL = 'https://ollama-api.mauelshagen.eu/v1'
const DEFAULT_MODEL = 'qwen3.5:9b'
const DEFAULT_TIMEOUT_MS = 60000

export async function getAiSettings(): Promise<AiSettingsData> {
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

  const row = await prisma.aiSettings.findUnique({
    where: { id: 'singleton' },
  })

  if (!row) {
    return {
      enabled: true,
      baseUrl: process.env.OPENAI_BASE_URL ?? DEFAULT_BASE_URL,
      model: process.env.OPENAI_MODEL ?? DEFAULT_MODEL,
      timeoutMs: Number.parseInt(
        process.env.OPENAI_TIMEOUT_MS ?? String(DEFAULT_TIMEOUT_MS),
        10
      ),
      hasApiKey: !!process.env.OPENAI_API_KEY,
    }
  }

  return {
    enabled: row.enabled,
    baseUrl: row.baseUrl
      ? await decrypt(row.baseUrl)
      : (process.env.OPENAI_BASE_URL ?? DEFAULT_BASE_URL),
    model: row.model
      ? await decrypt(row.model)
      : (process.env.OPENAI_MODEL ?? DEFAULT_MODEL),
    timeoutMs:
      row.timeoutMs ??
      Number.parseInt(
        process.env.OPENAI_TIMEOUT_MS ?? String(DEFAULT_TIMEOUT_MS),
        10
      ),
    hasApiKey: !!row.apiKey || !!process.env.OPENAI_API_KEY,
  }
}
