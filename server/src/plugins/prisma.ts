// Wraps PrismaClient with fp so app.prisma is available app-wide.
// Explicitly connects on startup and disconnects on server shutdown to prevent connection leaks.
import fp from 'fastify-plugin'
import { PrismaClient } from '@prisma/client'
import type { FastifyInstance } from 'fastify'

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient
  }
}

export default fp(async (app: FastifyInstance) => {
  const prisma = new PrismaClient()
  await prisma.$connect()

  app.decorate('prisma', prisma)
  app.addHook('onClose', async () => {
    await prisma.$disconnect()
  })
})
