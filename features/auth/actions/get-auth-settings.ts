'use server'

import { decrypt } from '@/features/auth/lib/encrypt'
import type { AuthSettingsData } from '@/features/auth/types'
import { prisma } from '@/features/shared/lib/prisma'

/**
 * Read auth settings from DB (admin-only).
 * Returns field values with secrets masked — only boolean `hasSecret` flags.
 */
export async function getAuthSettings(): Promise<AuthSettingsData> {
  const row = await prisma.authSettings.findUnique({
    where: { id: 'singleton' },
  })

  if (!row) {
    return {
      passwordEnabled: true,
      passkeyEnabled: true,
      microsoftEnabled: false,
      microsoftClientId: '',
      microsoftTenantId: '',
      microsoftHasSecret: false,
      githubEnabled: false,
      githubClientId: '',
      githubHasSecret: false,
      oauthEnabled: false,
      oauthClientId: '',
      oauthIssuerUrl: '',
      oauthHasSecret: false,
    }
  }

  return {
    passwordEnabled: row.passwordEnabled,
    passkeyEnabled: row.passkeyEnabled,

    microsoftEnabled: row.microsoftEnabled,
    microsoftClientId: row.microsoftClientId
      ? decrypt(row.microsoftClientId)
      : '',
    microsoftTenantId: row.microsoftTenantId
      ? decrypt(row.microsoftTenantId)
      : '',
    microsoftHasSecret: !!row.microsoftClientSecret,

    githubEnabled: row.githubEnabled,
    githubClientId: row.githubClientId ? decrypt(row.githubClientId) : '',
    githubHasSecret: !!row.githubClientSecret,

    oauthEnabled: row.oauthEnabled,
    oauthClientId: row.oauthClientId ? decrypt(row.oauthClientId) : '',
    oauthIssuerUrl: row.oauthIssuerUrl ? decrypt(row.oauthIssuerUrl) : '',
    oauthHasSecret: !!row.oauthClientSecret,
  }
}
