import 'dotenv/config'

import { PrismaClient } from '@/features/shared/lib/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}?schema=public`

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

export { prisma }
