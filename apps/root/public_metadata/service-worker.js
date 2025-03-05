/* eslint-disable */
const CACHE_NAME = 'balmy-cache-v1';

// Assets that should be cached immediately when SW is installed
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/site.webmanifest',
  // Static assets from public_metadata
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
  // Webpack bundles - using pattern matching
  '/app.*.bundle.js', // This will match your webpack output
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
    // Any missed JavaScript and CSS bundles
    urlPattern: /\.(js|css)$/,
    strategy: 'StaleWhileRevalidate',
  },
  {
    // API endpoints that can be cached
    urlPattern: /\/v2\/transforms\/to-underlying$/,
    strategy: 'NetworkFirst',
    maxAgeSeconds: 60 * 5, // 5 minutes
  },
  {
    // NFT data
    urlPattern: /\/nft\/data\//,
    strategy: 'NetworkFirst',
    maxAgeSeconds: 60 * 60, // 1 hour
  },
  {
    // Token lists
    urlPattern: /(tokens\.uniswap\.org|tokens\.coingecko\.com)/,
    strategy: 'NetworkFirst',
    maxAgeSeconds: 60 * 60, // 1 hour
  },
];

// Never cache these patterns
const EXCLUDE_FROM_CACHE = [
  // Browser extensions
  /^chrome-extension:\/\//,
  /^moz-extension:\/\//,
  // Wallet and Web3 requests
  /wallet/i,
  /eth-/i,
  // API endpoints that should never be cached
  /\/v1\/accounts\/.*\/balances$/,
  /\/v1\/simulate-blowfish-transaction$/,
  /\/v1\/error-reporting$/,
  // Chain RPC endpoints
  /infura\.io/,
  /alchemy\.com/,
  /ankr\.com/,
  /rpc\./,
];

// Helper function to check if URL should be cached
const shouldHandleRequest = (request) => {
  // Only handle GET requests
  if (request.method !== 'GET') return false;

  // Check the URL scheme
  const url = new URL(request.url);
  if (!['http:', 'https:'].includes(url.protocol)) return false;

  // Check exclusion patterns
  if (EXCLUDE_FROM_CACHE.some((pattern) => pattern.test(request.url))) return false;

  return true;
};

// Fetch event - handle runtime caching
self.addEventListener('fetch', (event) => {
  // Check if we should handle this request
  if (!shouldHandleRequest(event.request)) {
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
      event.respondWith(
        fetch(event.request)
          .then((response) => {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
            return response;
          })
          .catch(() => caches.match(event.request))
      );
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
