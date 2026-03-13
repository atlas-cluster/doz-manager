/**
 * Standalone script to create a single user in production.
 * Called by the GitHub Actions "Create User" workflow.
 *
 * Required env vars:
 *   CREATE_USER_EMAIL – user email
 *   CREATE_USER_NAME  – display name
 *   CREATE_USER_ADMIN – "true" to grant admin, anything else = regular user
 *   DB_HOST, DB_ROOT_USER, DB_ROOT_PASSWORD, DB_NAME – database connection
 *   BETTER_AUTH_SECRET (or AUTH_SECRET) – needed by better-auth
 *
 * Optional env vars:
 *   CREATE_USER_PASSWORD – explicit password (min 8 chars).
 *                          If omitted, a secure random password is generated
 *                          and printed to stdout exactly once.
 */
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import 'dotenv/config'
import { randomBytes } from 'node:crypto'

import { PrismaClient } from '@/features/shared/lib/generated/prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'

function getRequiredEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    console.error(`Missing required environment variable: ${name}`)
    process.exit(1)
  }
  return value
}

function generatePassword(length = 20): string {
  const charset =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*'
  const bytes = randomBytes(length)
  return Array.from(bytes, (b) => charset[b % charset.length]).join('')
}

async function main() {
  const email = getRequiredEnv('CREATE_USER_EMAIL').trim()
  const name = getRequiredEnv('CREATE_USER_NAME').trim()
  const isAdmin = process.env.CREATE_USER_ADMIN === 'true'

  let password = process.env.CREATE_USER_PASSWORD ?? ''
  let wasGenerated = false

  if (!password) {
    password = generatePassword()
    wasGenerated = true
  }

  if (password.length < 8) {
    console.error('Password must be at least 8 characters.')
    process.exit(1)
  }

  const adapter = new PrismaMariaDb({
    host: process.env.DB_HOST ?? '127.0.0.1',
    user: getRequiredEnv('DB_ROOT_USER'),
    password: getRequiredEnv('DB_ROOT_PASSWORD'),
    database: getRequiredEnv('DB_NAME'),
    connectionLimit: 5,
    allowPublicKeyRetrieval: true,
  })

  const prisma = new PrismaClient({ adapter })

  const auth = betterAuth({
    database: prismaAdapter(prisma, { provider: 'mysql' }),
    emailAndPassword: { enabled: true },
  })

  // Check for existing user
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    console.error(
      `User with email "${email}" already exists (id: ${existing.id}).`
    )
    process.exit(1)
  }

  // Create user via better-auth (handles password hashing etc.)
  await auth.api.signUpEmail({
    body: { email, password, name },
  })

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    console.error('User creation failed – user not found after sign-up.')
    process.exit(1)
  }

  // Optionally promote to admin
  if (isAdmin) {
    await prisma.user.update({
      where: { id: user.id },
      data: { isAdmin: true },
    })
  }

  console.log(`✅ Created ${isAdmin ? 'admin ' : ''}user: ${name} <${email}>`)

  if (wasGenerated) {
    // Print the generated password exactly once.
    // In GitHub Actions this is written to a step output
    // that is only visible to the person who triggered the run.
    console.log('')
    console.log('═══════════════════════════════════════════')
    console.log('  GENERATED PASSWORD (save it now!)')
    console.log(`  ${password}`)
    console.log('═══════════════════════════════════════════')
    console.log('')
    console.log('The user should change this password after first login.')
  }

  process.exit(0)
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
