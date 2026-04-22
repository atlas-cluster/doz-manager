'use server'

import { headers } from 'next/headers'

import { auth } from '@/features/auth/lib/auth'
import { decrypt } from '@/features/auth/lib/encrypt'
import { prisma } from '@/features/shared/lib/prisma'

type FetchModelsInput = {
  baseUrl: string
  apiKey: string
}

type ModelEntry = {
  id: string
  owned_by?: string
}

export async function fetchAvailableModels(
  data: FetchModelsInput
): Promise<{ models: ModelEntry[]; error?: string }> {
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

  let apiKey = data.apiKey
  if (!apiKey || apiKey === '__use_existing__') {
    const row = await prisma.aiSettings.findUnique({
      where: { id: 'singleton' },
      select: { apiKey: true },
    })
    if (row?.apiKey) {
      apiKey = await decrypt(row.apiKey)
    } else {
      apiKey = process.env.OPENAI_API_KEY ?? ''
    }
  }

  if (!data.baseUrl || !apiKey) {
    return { models: [], error: 'Base URL und API Key sind erforderlich.' }
  }

  try {
    const response = await fetch(`${data.baseUrl}/models`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      signal: AbortSignal.timeout(15000),
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unbekannter Fehler')
      return {
        models: [],
        error: `Server antwortete mit ${response.status}: ${errorText.slice(0, 200)}`,
      }
    }

    const result = (await response.json()) as {
      data?: Array<{ id: string; owned_by?: string }>
    }

    const models = (result.data ?? [])
      .map((m) => ({ id: m.id, owned_by: m.owned_by }))
      .sort((a, b) => a.id.localeCompare(b.id))

    return { models }
  } catch (error) {
    const message =
      error instanceof Error
        ? error.name === 'TimeoutError'
          ? 'Timeout beim Abrufen der Modelle.'
          : error.message
        : 'Unbekannter Fehler'

    return { models: [], error: message }
  }
}
