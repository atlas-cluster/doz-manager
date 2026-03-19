import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { genericOAuth } from 'better-auth/plugins'
import { twoFactor } from 'better-auth/plugins'
import { passkey } from '@better-auth/passkey'

import { decrypt } from '@/features/auth/lib/encrypt'
import { generateBackupCodes } from '@/features/auth/lib/backup-code-generate'
import { prisma } from '@/features/shared/lib/prisma'

const appName = 'Provadis Dozentenmanagement'

const resolvePasskeyRpId = (authUrl?: string) => {
  if (!authUrl) return 'localhost'
  try {
    return new URL(authUrl).hostname
  } catch {
    return 'localhost'
  }
}

const betterAuthUrl = process.env.BETTER_AUTH_URL

type SocialProviders = Parameters<typeof betterAuth>[0]['socialProviders']

function buildSocialProviders(
  row: {
    microsoftEnabled: boolean
    microsoftClientId: string | null
    microsoftClientSecret: string | null
    microsoftTenantId: string | null
    githubEnabled: boolean
    githubClientId: string | null
    githubClientSecret: string | null
  } | null
): SocialProviders {
  if (!row) return undefined

  const providers: NonNullable<SocialProviders> = {}

  if (
    row.microsoftEnabled &&
    row.microsoftClientId &&
    row.microsoftClientSecret
  ) {
    try {
      providers.microsoft = {
        clientId: decrypt(row.microsoftClientId),
        clientSecret: decrypt(row.microsoftClientSecret),
        tenantId: row.microsoftTenantId
          ? decrypt(row.microsoftTenantId)
          : 'common',
      }
    } catch {
      console.warn(
        '[auth] Failed to decrypt Microsoft OAuth credentials – provider will be disabled. ' +
          'Check AUTH_SETTINGS_ENCRYPTION_KEY and the stored DB values.'
      )
    }
  }

  if (row.githubEnabled && row.githubClientId && row.githubClientSecret) {
    try {
      providers.github = {
        clientId: decrypt(row.githubClientId),
        clientSecret: decrypt(row.githubClientSecret),
        disableSignUp: true,
      }
    } catch {
      console.warn(
        '[auth] Failed to decrypt GitHub OAuth credentials – provider will be disabled. ' +
          'Check AUTH_SETTINGS_ENCRYPTION_KEY and the stored DB values.'
      )
    }
  }

  return Object.keys(providers).length > 0 ? providers : undefined
}

function buildPlugins(
  row: {
    oauthEnabled: boolean
    oauthClientId: string | null
    oauthClientSecret: string | null
    oauthIssuerUrl: string | null
  } | null
) {
  const plugins = [
    passkey({
      rpID: resolvePasskeyRpId(betterAuthUrl),
      rpName: appName,
      origin: betterAuthUrl,
    }),
    twoFactor({
      backupCodeOptions: {
        customBackupCodesGenerate: generateBackupCodes,
      },
    }),
  ]

  if (
    row?.oauthEnabled &&
    row.oauthClientId &&
    row.oauthClientSecret &&
    row.oauthIssuerUrl
  ) {
    try {
      plugins.push(
        genericOAuth({
          config: [
            {
              providerId: 'oauth',
              discoveryUrl:
                decrypt(row.oauthIssuerUrl) +
                '/.well-known/openid-configuration',
              clientId: decrypt(row.oauthClientId),
              clientSecret: decrypt(row.oauthClientSecret),
              disableSignUp: true,
            },
          ],
        }) as never
      )
    } catch {
      console.warn(
        '[auth] Failed to decrypt generic OAuth credentials – provider will be disabled. ' +
          'Check AUTH_SETTINGS_ENCRYPTION_KEY and the stored DB values.'
      )
    }
  }

  return plugins
}

function createAuthInstance(
  row: {
    passwordEnabled: boolean
    microsoftEnabled: boolean
    microsoftClientId: string | null
    microsoftClientSecret: string | null
    microsoftTenantId: string | null
    githubEnabled: boolean
    githubClientId: string | null
    githubClientSecret: string | null
    oauthEnabled: boolean
    oauthClientId: string | null
    oauthClientSecret: string | null
    oauthIssuerUrl: string | null
  } | null
) {
  return betterAuth({
    database: prismaAdapter(prisma, {
      provider: 'mysql',
    }),
    appName,
    emailAndPassword: {
      enabled: true,
    },
    account: {
      accountLinking: {
        enabled: true,
        trustedProviders: ['microsoft', 'github', 'oauth'],
      },
    },
    socialProviders: buildSocialProviders(row),
    plugins: buildPlugins(row),
    databaseHooks: {
      account: {
        create: {
          before: async (account) => {
            const providerId = (account as Record<string, unknown>)
              .providerId as string | undefined

            // Microsoft (EntraID) is tenant-controlled → allow self-registration
            // Password (credential) and passkey are always allowed
            if (
              !providerId ||
              providerId === 'credential' ||
              providerId === 'microsoft' ||
              providerId === 'passkey'
            ) {
              return true
            }

            // For GitHub and OAuth: disableSignUp on the provider config
            // already prevents new-user creation. This hook is an extra
            // safety net — only allow linking when a user record was
            // pre-provisioned by an admin.
            const userId = (account as Record<string, unknown>).userId as
              | string
              | undefined
            if (!userId) return false

            // Check that the user has been around for more than a few
            // seconds (i.e. was pre-provisioned, not just auto-created).
            const existingUser = await prisma.user.findUnique({
              where: { id: userId },
              select: { createdAt: true },
            })
            if (!existingUser) return false

            const ageMs =
              Date.now() - new Date(existingUser.createdAt).getTime()
            return ageMs > 10_000 // user must have existed for >10s
          },
        },
      },
    },
  })
}

// Start with a default instance (password + passkey only)
export let auth = createAuthInstance(null)

/**
 * Re-create the BetterAuth instance from current DB settings.
 * Called after admin saves settings.
 */
export async function reinitializeAuth() {
  const row = await prisma.authSettings.findUnique({
    where: { id: 'singleton' },
  })
  auth = createAuthInstance(row)
}

/**
 * Ensure the auth instance is initialized from DB settings.
 * Safe to call multiple times.
 */
export async function ensureAuthInitialized() {
  const row = await prisma.authSettings.findUnique({
    where: { id: 'singleton' },
  })
  auth = createAuthInstance(row)
}
