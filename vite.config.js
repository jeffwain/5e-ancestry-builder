import { Buffer } from 'node:buffer'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { codeInspectorPlugin } from 'code-inspector-plugin'
import { readSources, writeSlot } from './scripts/ancestry-source-api.mjs'

/**
 * Dev-only API behind the /editor page.
 *
 * The editor writes back to public/data/ancestries-*.mjs, which a browser
 * cannot do on its own — these two endpoints are the bridge. They are attached
 * to the dev server only, so nothing here ships in a production build.
 */
function ancestryEditorApi() {
  return {
    name: 'ancestry-editor-api',
    apply: 'serve',
    configureServer(server) {
      const json = (res, status, body) => {
        res.statusCode = status
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        res.end(JSON.stringify(body))
      }

      server.middlewares.use('/api/ancestry-source', (req, res, next) => {
        if (req.method === 'GET') {
          try {
            json(res, 200, { sources: readSources() })
          } catch (err) {
            json(res, 500, { error: err.message })
          }
          return
        }

        if (req.method === 'POST') {
          // Collect raw buffers and decode once. Concatenating chunks as strings
          // corrupts any multi-byte character that straddles a chunk boundary,
          // and these files are full of curly quotes.
          const chunks = []
          req.on('data', (chunk) => { chunks.push(chunk) })
          req.on('end', () => {
            try {
              const body = Buffer.concat(chunks).toString('utf8')
              const payload = JSON.parse(body || '{}')
              const result = writeSlot(payload)
              json(res, 200, { ok: true, ...result })
            } catch (err) {
              json(res, 400, { error: err.message })
            }
          })
          return
        }

        next()
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    // React analog of tidy’s Svelte inspector: hold Ctrl+Alt+Shift, click a node, open source in Cursor.
    codeInspectorPlugin({
      bundler: 'vite',
      editor: 'cursor',
      hotKeys: ['ctrlKey', 'altKey', 'shiftKey'],
      // File import into the SPA entry; skip the empty HTML snippet the plugin also injects.
      importClient: 'file',
      skipSnippets: ['htmlScript'],
    }),
    react(),
    ancestryEditorApi(),
  ],
  logLevel: 'info',
  server: {
    host: true,
  },
})
