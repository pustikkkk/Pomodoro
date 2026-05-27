// Module augmentation tells @fastify/jwt the shape of the decoded token,
// making request.user.sub and request.user.username available with full type safety.
import type { FastifyRequest, FastifyReply } from 'fastify'
import { unauthorized } from '../utils/errors.js'

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { sub: string; username: string }
    user: { sub: string; username: string }
  }
}

// Prehandler middleware — verifies the JWT from the 'token' cookie.
// Use as { preHandler: [authenticate] } on any protected route.
export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify()
  } catch {
    return unauthorized(reply)
  }
}
