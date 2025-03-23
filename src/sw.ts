import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching'
import { registerRoute, NavigationRoute } from 'workbox-routing'
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'
import { CacheableResponsePlugin } from 'workbox-cacheable-response'
import { Queue } from 'workbox-background-sync'

declare let self: ServiceWorkerGlobalScope

// Create a sync queue for offline mutations
const syncQueue = new Queue('offlineQueue', {
  maxRetentionTime: 24 * 60, // Retry for up to 24 hours
})

// Precache all static assets
precacheAndRoute(self.__WB_MANIFEST)

// Cache the offline page
registerRoute(
  ({ request }) => request.destination === 'document',
  new NetworkFirst({
    cacheName: 'pages',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
)

// Cache static assets (JS, CSS, images)
registerRoute(
  ({ request }) =>
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'image',
  new CacheFirst({
    cacheName: 'static-assets',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  })
)

// Cache API responses
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 5 * 60, // Cache for 5 minutes
      }),
    ],
  })
)

// Handle offline mutations
self.addEventListener('fetch', event => {
  if (
    event.request.method === 'POST' ||
    event.request.method === 'PUT' ||
    event.request.method === 'DELETE'
  ) {
    const bgSyncLogic = async () => {
      try {
        const response = await fetch(event.request.clone())
        return response
      } catch (error) {
        await syncQueue.pushRequest({
          request: event.request,
        })
        return new Response(
          JSON.stringify({
            offline: true,
            queued: true,
          }),
          {
            headers: { 'Content-Type': 'application/json' },
          }
        )
      }
    }

    event.respondWith(bgSyncLogic())
  }
})

// Handle sync events
self.addEventListener('sync', event => {
  if (event.tag === 'offlineQueue') {
    event.waitUntil(syncQueue.replayRequests())
  }
})

// Handle navigation
const handler = createHandlerBoundToURL('/index.html')
const navigationRoute = new NavigationRoute(handler, {
  allowlist: [new RegExp('^/')],
})
registerRoute(navigationRoute)
