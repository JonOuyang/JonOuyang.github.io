import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Dev-only middleware that runs the Vercel-style /api handlers under `npm run
// dev` so the booking flow works locally without `vercel dev`. Handlers are
// loaded with server.ssrLoadModule so edits hot-reload.
function apiDevMiddleware() {
  const routes = {
    '/api/freebusy': '/api/freebusy.js',
    '/api/book': '/api/book.js',
    '/api/check-email': '/api/check-email.js',
  }

  return {
    name: 'api-dev-middleware',
    apply: 'serve',
    configureServer(server) {
      const env = loadEnv(server.config.mode, process.cwd(), '')
      for (const [key, value] of Object.entries(env)) {
        if (process.env[key] === undefined) process.env[key] = value
      }

      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url, 'http://localhost')
        const modulePath = routes[url.pathname]
        if (!modulePath) {
          next()
          return
        }

        try {
          const mod = await server.ssrLoadModule(modulePath)
          const handler = mod.default

          req.query = Object.fromEntries(url.searchParams.entries())

          if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
            const chunks = []
            for await (const chunk of req) chunks.push(chunk)
            const raw = Buffer.concat(chunks).toString('utf8')
            try {
              req.body = raw ? JSON.parse(raw) : {}
            } catch {
              req.body = {}
            }
          }

          res.status = (code) => {
            res.statusCode = code
            return res
          }
          res.json = (obj) => {
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(obj))
          }

          await handler(req, res)
        } catch (err) {
          console.error('[api-dev-middleware]', err)
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'dev_middleware_error' }))
        }
      })
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), apiDevMiddleware()],
  server: {
    watch: {
      usePolling: true,
      interval: 100,
      ignored: [
        '**/hidden-local/**',
        '**/scratchpad/**',
        '**/dist/**',
      ],
    },
  },
})
