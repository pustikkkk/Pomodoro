// Thin wrappers around Fastify reply for consistent error response shape: { error, message }.
import type { FastifyReply } from 'fastify'

export function badRequest(reply: FastifyReply, message: string) {
  return reply.status(400).send({ error: 'BAD_REQUEST', message })
}

export function unauthorized(reply: FastifyReply, message = 'Unauthorized') {
  return reply.status(401).send({ error: 'UNAUTHORIZED', message })
}

export function forbidden(reply: FastifyReply, message = 'Forbidden') {
  return reply.status(403).send({ error: 'FORBIDDEN', message })
}

export function notFound(reply: FastifyReply, message = 'Not found') {
  return reply.status(404).send({ error: 'NOT_FOUND', message })
}

export function conflict(reply: FastifyReply, message: string) {
  return reply.status(409).send({ error: 'CONFLICT', message })
}

export function tooManyRequests(reply: FastifyReply, message: string) {
  return reply.status(429).send({ error: 'TOO_MANY_REQUESTS', message })
}
