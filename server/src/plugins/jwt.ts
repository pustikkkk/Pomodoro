// Configures @fastify/jwt to read the token from the 'token' httpOnly cookie (set in verify-code).
// Cookie-based JWTs prevent XSS scripts from accessing the token via document.cookie.
// The 7d expiry mirrors the cookie maxAge set when issuing the token.
import fp from 'fastify-plugin'
import fjwt from '@fastify/jwt'
import type { FastifyInstance } from 'fastify'
import { env } from '../config/env.js'

export default fp(async (app: FastifyInstance) => {
  app.register(fjwt, {
    secret: env.JWT_SECRET,
    cookie: {
      cookieName: 'token',
      signed: false,
    },
    sign: {
      expiresIn: '7d',
    },
  })
})
