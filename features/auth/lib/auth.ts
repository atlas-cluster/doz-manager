import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { twoFactor } from 'better-auth/plugins'

import { generateBackupCodes } from '@/features/auth/lib/backup-code-generate'
import { prisma } from '@/features/shared/lib/prisma'

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'mysql',
  }),
  appName: 'Provadis Dozentenmanagement',
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    twoFactor({
      backupCodeOptions: {
        customBackupCodesGenerate: generateBackupCodes,
      },
    }),
  ],
})
