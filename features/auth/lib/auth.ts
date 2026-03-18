import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { twoFactor } from 'better-auth/plugins'
import { passkey } from '@better-auth/passkey'

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

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'mysql',
  }),
  appName,
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
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
  ],
})
