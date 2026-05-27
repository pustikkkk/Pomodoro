// Restricts cross-origin access to CLIENT_ORIGIN only.
// credentials: true is required so the browser includes the httpOnly cookie in cross-origin requests.
// Without it, the JWT cookie would never be sent to the API.
import fp from 'fastify-plugin'
import fcors from '@fastify/cors'
import type { FastifyInstance } from 'fastify'
import { env } from '../config/env.js'

export default fp(async (app: FastifyInstance) => {
  app.register(fcors, {
    origin: env.CLIENT_ORIGIN,
    credentials: true,
  })
})
