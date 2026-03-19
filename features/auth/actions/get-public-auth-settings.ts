'use server'

import type { PublicAuthSettings } from '@/features/auth/types'
import { prisma } from '@/features/shared/lib/prisma'

/**
 * Read only the public boolean flags — safe for the login page.
 * No authentication required.
 */
export async function getPublicAuthSettings(): Promise<PublicAuthSettings> {
  const row = await prisma.authSettings.findUnique({
    where: { id: 'singleton' },
    select: {
      passwordEnabled: true,
      passkeyEnabled: true,
      microsoftEnabled: true,
      githubEnabled: true,
      oauthEnabled: true,
      microsoftClientId: true,
      microsoftClientSecret: true,
      githubClientId: true,
      githubClientSecret: true,
      oauthClientId: true,
      oauthClientSecret: true,
      oauthIssuerUrl: true,
    },
  })

  if (!row) {
    return {
      passwordEnabled: true,
      passkeyEnabled: true,
      microsoftEnabled: false,
      githubEnabled: false,
      oauthEnabled: false,
    }
  }

  // A provider is only truly enabled if the flag is on AND credentials exist
  const microsoftReady =
    row.microsoftEnabled &&
    !!row.microsoftClientId &&
    !!row.microsoftClientSecret
  const githubReady =
    row.githubEnabled && !!row.githubClientId && !!row.githubClientSecret
  const oauthReady =
    row.oauthEnabled &&
    !!row.oauthClientId &&
    !!row.oauthClientSecret &&
    !!row.oauthIssuerUrl

  return {
    passwordEnabled: row.passwordEnabled,
    passkeyEnabled: row.passkeyEnabled,
    microsoftEnabled: microsoftReady,
    githubEnabled: githubReady,
    oauthEnabled: oauthReady,
  }
}
