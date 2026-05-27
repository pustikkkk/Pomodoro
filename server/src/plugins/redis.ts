// Wraps ioredis with fp (fastify-plugin) so app.redis is visible across all plugins/routes,
// not just within this plugin's scope. Closes the connection gracefully on server shutdown.
import fp from 'fastify-plugin'
import Redis from 'ioredis'
import type { FastifyInstance } from 'fastify'
import { env } from '../config/env.js'

declare module 'fastify' {
  interface FastifyInstance {
    redis: Redis
  }
}

export default fp(async (app: FastifyInstance) => {
  const redis = new Redis(env.REDIS_URL)

  redis.on('error', (err) => app.log.error({ err }, 'Redis error'))

  app.decorate('redis', redis)
  // quit() sends QUIT to Redis and waits for the server to close the connection cleanly.
  app.addHook('onClose', async () => {
    await redis.quit()
  })
})
