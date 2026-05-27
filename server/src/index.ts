// Server entry point — builds the Fastify app and starts listening.
import { buildApp } from './app.js'
import { env } from './config/env.js'

const app = buildApp()

// Bind to 0.0.0.0 so the server is reachable inside Docker/containers, not just localhost.
app.listen({ port: env.PORT, host: '0.0.0.0' }, (err) => {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
})
