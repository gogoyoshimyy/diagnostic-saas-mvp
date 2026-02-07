import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

const connectionString = process.env.TURSO_DATABASE_URL
const authToken = process.env.TURSO_AUTH_TOKEN

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

const turso = createClient({
    url: connectionString!,
    authToken: authToken,
})

const adapter = new PrismaLibSql(turso)

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
