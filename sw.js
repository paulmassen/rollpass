// Generated at build time — do not edit.
const CACHE = 'rollpass-d4328da10ff1'
const ASSETS = ["./","apple-touch-icon.png","assets/figtree-latin-400-normal-g7Dtegnw.woff2","assets/figtree-latin-500-normal-BWnGEVsr.woff2","assets/figtree-latin-600-normal-Cv_xCTDl.woff2","assets/figtree-latin-700-normal-th6qEP7c.woff2","assets/ibm-plex-mono-latin-400-normal-DMJ8VG8y.woff2","assets/ibm-plex-mono-latin-500-normal-DSY6xOcd.woff2","assets/ibm-plex-mono-latin-600-normal-BgSNZQsw.woff2","assets/index-BV-z8FM5.css","assets/index-Cs8aCrtP.js","assets/syne-latin-600-normal-BiwQbQXw.woff2","assets/syne-latin-700-normal-AF3Rs61n.woff2","assets/syne-latin-800-normal-EehdNYzx.woff2","favicon.svg","icon-192.png","icon-512.png","icon-maskable-512.png","index.html","manifest.webmanifest","og-image.png"]

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
