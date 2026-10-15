import { createHash } from 'node:crypto'
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vitest/config'

/**
 * Content Security Policy. Applied via <meta> at build time (GitHub Pages
 * does not allow setting HTTP headers); vercel.json sets the equivalent as a
 * header. Not applied in dev (Vite's HMR needs inline scripts).
 */
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "manifest-src 'self'",
  "worker-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'none'",
].join('; ')

/** Injects the CSP and, if SITE_URL is set, absolute URLs (Open Graph...). */
function htmlMeta(): Plugin {
  const siteUrl = process.env.SITE_URL?.replace(/\/+$/, '')
  return {
    name: 'rollpass-html-meta',
    apply: 'build',
    transformIndexHtml() {
      const tags: { tag: string; attrs: Record<string, string>; injectTo: 'head-prepend' | 'head' }[] = [
        {
          tag: 'meta',
          attrs: { 'http-equiv': 'Content-Security-Policy', content: CSP },
          injectTo: 'head-prepend',
        },
      ]
      if (siteUrl) {
        const image = `${siteUrl}/og-image.png`
        tags.push(
          { tag: 'link', attrs: { rel: 'canonical', href: `${siteUrl}/` }, injectTo: 'head' },
          { tag: 'meta', attrs: { property: 'og:url', content: `${siteUrl}/` }, injectTo: 'head' },
          { tag: 'meta', attrs: { property: 'og:image', content: image }, injectTo: 'head' },
          { tag: 'meta', attrs: { name: 'twitter:image', content: image }, injectTo: 'head' },
        )
      }
      return tags
    },
  }
}

/** Generates sw.js: precaches the whole build for offline use. */
function offlineServiceWorker(): Plugin {
  let outDir = 'dist'
  return {
    name: 'rollpass-sw',
    apply: 'build',
    configResolved(config) {
      outDir = config.build.outDir
    },
    writeBundle() {
      const files: string[] = []
      const walk = (dir: string) => {
        for (const name of readdirSync(dir)) {
          const full = join(dir, name)
          if (statSync(full).isDirectory()) walk(full)
          else files.push(full)
        }
      }
      walk(outDir)

      const urls = files
        .map((f) => relative(outDir, f).split(sep).join('/'))
        .filter((f) => f !== 'sw.js' && f !== '.nojekyll')
        // All modern browsers support woff2: no need to precache the fallback .woff
        .filter((f) => !f.endsWith('.woff'))
        .sort()
      const hash = createHash('sha256')
      for (const url of urls) hash.update(url).update(readFileSync(join(outDir, url)))
      const version = hash.digest('hex').slice(0, 12)

      const sw = `// Generated at build time — do not edit.
const CACHE = 'rollpass-${version}'
const ASSETS = ${JSON.stringify(['./', ...urls])}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  if (new URL(request.url).origin !== self.location.origin) return
  event.respondWith(
    caches.match(request).then(
      (hit) =>
        hit ||
        fetch(request).catch(() =>
          request.mode === 'navigate' ? caches.match('./index.html') : Response.error(),
        ),
    ),
  )
})
`
      writeFileSync(join(outDir, 'sw.js'), sw)
      writeFileSync(join(outDir, '.nojekyll'), '')
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  // Relative paths: works at the root (Vercel) as well as under /rollpass/ (GitHub Pages)
  base: './',
  plugins: [react(), htmlMeta(), offlineServiceWorker()],
  build: {
    // No inlining as data: URIs (keeps the CSP strict)
    assetsInlineLimit: 0,
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
