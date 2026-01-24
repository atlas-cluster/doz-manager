import 'dotenv/config'

import { PrismaClient } from '@/features/shared/lib/generated/prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'

const adapter = new PrismaMariaDb({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 5,
})

const prisma = new PrismaClient({ adapter })

export { prisma }
