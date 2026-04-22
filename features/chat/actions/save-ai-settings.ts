'use server'

import { updateTag } from 'next/cache'
import { headers } from 'next/headers'

import { auth } from '@/features/auth/lib/auth'
import { encrypt } from '@/features/auth/lib/encrypt'
import { prisma } from '@/features/shared/lib/prisma'

type SaveAiSettingsInput = {
  enabled: boolean
  baseUrl: string
  apiKey?: string
  model: string
  timeoutMs: number
}

export async function saveAiSettings(data: SaveAiSettingsInput) {
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

  const existing = await prisma.aiSettings.findUnique({
    where: { id: 'singleton' },
  })

  const encryptOrKeep = async (
    newValue: string | undefined,
    existingValue: string | null | undefined
  ): Promise<string | null> => {
    if (newValue !== undefined && newValue !== '') {
      return await encrypt(newValue)
    }
    return existingValue ?? null
  }

  await prisma.aiSettings.upsert({
    where: { id: 'singleton' },
    create: {
      id: 'singleton',
      enabled: data.enabled,
      baseUrl: data.baseUrl ? await encrypt(data.baseUrl) : null,
      apiKey: await encryptOrKeep(data.apiKey, null),
      model: data.model ? await encrypt(data.model) : null,
      timeoutMs: data.timeoutMs,
    },
    update: {
      enabled: data.enabled,
      baseUrl: data.baseUrl ? await encrypt(data.baseUrl) : null,
      apiKey: await encryptOrKeep(data.apiKey, existing?.apiKey),
      model: data.model ? await encrypt(data.model) : null,
      timeoutMs: data.timeoutMs,
    },
  })

  updateTag('ai-settings')
}
