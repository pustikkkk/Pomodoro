// Registers @fastify/cookie so request.cookies is populated.
// Must be registered before the JWT plugin, which depends on cookie parsing to read the 'token' cookie.
import fp from 'fastify-plugin'
import fcookie from '@fastify/cookie'
import type { FastifyInstance } from 'fastify'

export default fp(async (app: FastifyInstance) => {
  app.register(fcookie)
})
