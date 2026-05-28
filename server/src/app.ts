import fs from 'fs'
import { join } from 'path'
import Fastify, { type FastifyInstance } from 'fastify'
import staticPlugin from '@fastify/static'
import corsPlugin from './plugins/cors.js'
import cookiePlugin from './plugins/cookie.js'
import jwtPlugin from './plugins/jwt.js'
import prismaPlugin from './plugins/prisma.js'
import redisPlugin from './plugins/redis.js'
import authRoutes from './routes/auth/index.js'
import timerRoutes from './routes/timers/index.js'
import starsRoutes from './routes/stars/index.js'
import { env } from './config/env.js'

// __dirname is a native CommonJS global — no import.meta polyfill needed.

// Returns TLS options for development. In production Railway terminates TLS at the edge,
// so the app itself runs plain HTTP behind the proxy — no certs needed there.
function getTlsOptions() {
  if (env.NODE_ENV === 'production') return undefined
  const certDir = join(__dirname, '../../certs')
  try {
    return {
      key: fs.readFileSync(join(certDir, 'localhost-key.pem')),
      cert: fs.readFileSync(join(certDir, 'localhost.pem')),
    }
  } catch {
    throw new Error(
      'TLS certs not found. Run:\n  mkcert -cert-file certs/localhost.pem -key-file certs/localhost-key.pem localhost 127.0.0.1'
    )
  }
}

export function buildApp() {
  const tlsOpts = getTlsOptions()
  // Cast collapses FastifyInstance<HttpsServer> | FastifyInstance<HttpServer> union —
  // both branches have identical method signatures for our usage.
  const app = (tlsOpts
    ? Fastify({ logger: true, https: tlsOpts })
    : Fastify({ logger: true })) as FastifyInstance

  // Plugin order matters: cookie must be registered before jwt so the JWT plugin
  // can parse the 'token' cookie on incoming requests.
  app.register(corsPlugin)
  app.register(cookiePlugin)
  app.register(jwtPlugin)
  app.register(prismaPlugin)
  app.register(redisPlugin)

  app.register(authRoutes, { prefix: '/api/v1/auth' })
  app.register(timerRoutes, { prefix: '/api/v1/timers' })
  app.register(starsRoutes, { prefix: '/api/v1/stars' })

  app.get('/health', async () => ({ ok: true }))

  if (env.NODE_ENV === 'production') {
    const clientDist = join(__dirname, '../../client/dist')
    app.register(staticPlugin, { root: clientDist, wildcard: false })
    app.setNotFoundHandler((request, reply) => {
      if (request.url.startsWith('/api/')) {
        reply.code(404).send({ message: 'Not Found' })
        return
      }
      reply.sendFile('index.html')
    })
  }

  return app
}
