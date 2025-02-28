/* eslint-disable */
const CACHE_NAME = 'balmy-cache-v1';

// Assets that should be cached immediately when SW is installed
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  // Static assets
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
  '/maskable_icon.png',
  // Add your main CSS/JS bundles
  '/main.js',
  '/main.css',
  // Fonts if you're hosting them locally
  // '/fonts/your-font.woff2',
];

// Runtime caching strategies
const RUNTIME_CACHING_RULES = [
  {
    // Static assets like images, fonts, etc.
    urlPattern: /\.(?:png|jpg|jpeg|svg|gif|woff|woff2)$/,
    strategy: 'CacheFirst',
    maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
  },
  {
    // API calls that can be served from cache
    urlPattern: /\/api\/static\//,
    strategy: 'StaleWhileRevalidate',
    maxAgeSeconds: 60 * 60, // 1 hour
  },
  {
    // Token lists, pairs, etc.
    urlPattern: /\/api\/tokens/,
    strategy: 'NetworkFirst',
    maxAgeSeconds: 5 * 60, // 5 minutes
  },
];

// Install event - precache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS)));
});

// Fetch event - handle runtime caching
self.addEventListener('fetch', (event) => {
  // Don't cache:
  // 1. Wallet connection requests
  // 2. Web3 RPC calls
  // 3. Transaction requests
  if (event.request.url.includes('wallet') || event.request.url.includes('eth-') || event.request.method !== 'GET') {
    return;
  }

  // Find matching cache rule
  const matchingRule = RUNTIME_CACHING_RULES.find((rule) => rule.urlPattern.test(event.request.url));

  if (matchingRule) {
    if (matchingRule.strategy === 'CacheFirst') {
      event.respondWith(
        caches.match(event.request).then(
          (response) =>
            response ||
            fetch(event.request).then((response) => {
              const responseClone = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseClone);
              });
              return response;
            })
        )
      );
    } else if (matchingRule.strategy === 'NetworkFirst') {
      event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
    } else if (matchingRule.strategy === 'StaleWhileRevalidate') {
      event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
          const fetchPromise = fetch(event.request).then((response) => {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
            return response;
          });
          return cachedResponse || fetchPromise;
        })
      );
    }
  }
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name)));
    })
  );
});
