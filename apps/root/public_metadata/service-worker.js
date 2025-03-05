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
    urlPattern: new RegExp(`${MEAN_API_URL}/v2/transforms/to-underlying`),
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
  // Wallet and Web3 requests
  /wallet/i,
  /eth-/i,
  // API endpoints that should never be cached
  new RegExp(`${MEAN_API_URL}/v1/accounts/.*/balances`), // Always fresh balances
  new RegExp(`${MEAN_API_URL}/v1/simulate-blowfish-transaction`), // Transaction simulations
  new RegExp(`${MEAN_API_URL}/v1/error-reporting`), // Error reports
  // Chain RPC endpoints
  /infura\.io/,
  /alchemy\.com/,
  /ankr\.com/,
  /rpc\./,
];

// Fetch event - handle runtime caching
self.addEventListener('fetch', (event) => {
  // Check exclusion patterns first
  if (event.request.method !== 'GET' || EXCLUDE_FROM_CACHE.some((pattern) => pattern.test(event.request.url))) {
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
