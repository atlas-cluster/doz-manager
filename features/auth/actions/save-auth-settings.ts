'use server'

import { updateTag } from 'next/cache'
import { headers } from 'next/headers'

import { encrypt } from '@/features/auth/lib/encrypt'
import { auth, reinitializeAuth } from '@/features/auth/lib/auth'
import { prisma } from '@/features/shared/lib/prisma'
import { publishScopeUpdate } from '@/features/shared/lib/update-stream'

type SaveAuthSettingsInput = {
  passwordEnabled: boolean
  passkeyEnabled: boolean

  microsoftEnabled: boolean
  microsoftClientId?: string
  microsoftClientSecret?: string
  microsoftTenantId?: string

  githubEnabled: boolean
  githubClientId?: string
  githubClientSecret?: string

  oauthEnabled: boolean
  oauthClientId?: string
  oauthClientSecret?: string
  oauthIssuerUrl?: string
}

export async function saveAuthSettings(data: SaveAuthSettingsInput) {
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

  // Enforce: at least one auth method must stay enabled
  const enabledCount = [
    data.passwordEnabled,
    data.passkeyEnabled,
    data.microsoftEnabled,
    data.githubEnabled,
    data.oauthEnabled,
  ].filter(Boolean).length

  if (enabledCount === 0) {
    throw new Error('Mindestens eine Anmeldemethode muss aktiviert bleiben.')
  }

  // Read existing row to preserve secrets that weren't re-submitted
  const existing = await prisma.authSettings.findUnique({
    where: { id: 'singleton' },
  })

  // Encrypt non-empty strings, keep existing encrypted value, or null
  const encryptOrKeep = async (
    newValue: string | undefined,
    existingValue: string | null | undefined
  ): Promise<string | null> => {
    if (newValue !== undefined && newValue !== '') {
      return await encrypt(newValue)
    }
    return existingValue ?? null
  }

  await prisma.authSettings.upsert({
    where: { id: 'singleton' },
    create: {
      id: 'singleton',
      passwordEnabled: data.passwordEnabled,
      passkeyEnabled: data.passkeyEnabled,

      microsoftEnabled: data.microsoftEnabled,
      microsoftClientId: await encryptOrKeep(data.microsoftClientId, null),
      microsoftClientSecret: await encryptOrKeep(
        data.microsoftClientSecret,
        null
      ),
      microsoftTenantId: await encryptOrKeep(data.microsoftTenantId, null),

      githubEnabled: data.githubEnabled,
      githubClientId: await encryptOrKeep(data.githubClientId, null),
      githubClientSecret: await encryptOrKeep(data.githubClientSecret, null),

      oauthEnabled: data.oauthEnabled,
      oauthClientId: await encryptOrKeep(data.oauthClientId, null),
      oauthClientSecret: await encryptOrKeep(data.oauthClientSecret, null),
      oauthIssuerUrl: await encryptOrKeep(data.oauthIssuerUrl, null),
    },
    update: {
      passwordEnabled: data.passwordEnabled,
      passkeyEnabled: data.passkeyEnabled,

      microsoftEnabled: data.microsoftEnabled,
      microsoftClientId: await encryptOrKeep(
        data.microsoftClientId,
        existing?.microsoftClientId
      ),
      microsoftClientSecret: await encryptOrKeep(
        data.microsoftClientSecret,
        existing?.microsoftClientSecret
      ),
      microsoftTenantId: await encryptOrKeep(
        data.microsoftTenantId,
        existing?.microsoftTenantId
      ),

      githubEnabled: data.githubEnabled,
      githubClientId: await encryptOrKeep(
        data.githubClientId,
        existing?.githubClientId
      ),
      githubClientSecret: await encryptOrKeep(
        data.githubClientSecret,
        existing?.githubClientSecret
      ),

      oauthEnabled: data.oauthEnabled,
      oauthClientId: await encryptOrKeep(
        data.oauthClientId,
        existing?.oauthClientId
      ),
      oauthClientSecret: await encryptOrKeep(
        data.oauthClientSecret,
        existing?.oauthClientSecret
      ),
      oauthIssuerUrl: await encryptOrKeep(
        data.oauthIssuerUrl,
        existing?.oauthIssuerUrl
      ),
    },
  })

  // Re-create the BetterAuth instance with the new settings
  await reinitializeAuth()

  updateTag('auth-settings')
  updateTag('users')
  publishScopeUpdate('users')
}
