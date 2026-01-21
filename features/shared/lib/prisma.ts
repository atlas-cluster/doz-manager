import 'dotenv/config'
import { Pool } from 'pg'

import { PrismaClient } from '@/features/shared/lib/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString =
  process.env.DATABASE_URL ??
  `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}?schema=public`

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

export { prisma }
