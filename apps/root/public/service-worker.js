const CACHE_NAME = 'balmy-cache-v1';
const STATIC_CACHE_NAME = 'balmy-static-cache-v1';
const API_CACHE_NAME = 'balmy-api-cache-v1';

// Get the environment from the hostname
const getEnvironment = () => {
  const hostname = self.location.hostname;
  if (hostname.includes('staging.app.balmy.xyz')) return 'staging';
  if (hostname.includes('dev.app.balmy.xyz')) return 'dev';
  if (hostname.includes('adhoc.app.balmy.xyz')) return 'adhoc';
  return 'production'; // Default to production for app.balmy.xyz
};

// Append environment to cache names to avoid cross-environment contamination
const environment = getEnvironment();
const ENVIRONMENT_STATIC_CACHE_NAME = `${STATIC_CACHE_NAME}-${environment}`;
const ENVIRONMENT_API_CACHE_NAME = `${API_CACHE_NAME}-${environment}`;

// Get the base path from the service worker's location
const getBasePath = () => {
  const swPath = self.location.pathname;
  // The service worker is at /service-worker.js, so the base path is /
  return swPath.substring(0, swPath.lastIndexOf('/') + 1);
};

const BASE_PATH = getBasePath();

// Static assets that should always be cached
const STATIC_ASSETS = [
  BASE_PATH,
  `${BASE_PATH}index.html`,
  `${BASE_PATH}offline.html`,
  `${BASE_PATH}site.webmanifest`,
  `${BASE_PATH}favicon.svg`,
  `${BASE_PATH}favicon.png`,
  `${BASE_PATH}favicon-32x32.png`,
  `${BASE_PATH}favicon-16x16.png`,
  `${BASE_PATH}apple-touch-icon.png`,
  `${BASE_PATH}android-chrome-192x192.png`,
  `${BASE_PATH}android-chrome-512x512.png`,
  `${BASE_PATH}maskable_icon.png`,
];

// API endpoints that can be cached (read-only endpoints)
const CACHEABLE_API_ENDPOINTS = [
  // Token lists and static data
  /\/v2\/indexer\/status/,
  /\/v2\/dca\/owns-positions/,
  /\/v1\/optimism-airdrop\//,
  // NFT data is typically static
  /\/nft\/data/,
];

// API endpoints that should never be cached (write operations, authentication, etc.)
const NEVER_CACHE_ENDPOINTS = [
  // Authentication and user data
  /\/v1\/accounts\/.*\/wallets/,
  /\/v1\/accounts\/.*\/labels/,
  /\/v1\/accounts\/.*\/contacts/,
  /\/v1\/accounts\/.*\/config/,
  /\/v1\/accounts\/.*\/earn/,
  // Error reporting and feedback
  /\/v1\/error-reporting/,
  /\/v1\/log-feedback/,
  /\/v1\/email-subscription/,
  // Transaction simulation
  /\/v1\/simulate-blowfish-transaction/,
  // Cache invalidation
  /\/v1\/accounts\/.*\/balances\/invalidate/,
];

// Valid domains for the application
const VALID_DOMAINS = [
  'app.balmy.xyz',
  'staging.app.balmy.xyz',
  'dev.app.balmy.xyz',
  'adhoc.app.balmy.xyz',
  'api.balmy.xyz',
  'mean.finance',
  // Include localhost for development
  'localhost',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(ENVIRONMENT_STATIC_CACHE_NAME)
      .then((cache) => {
        console.log(`Opened cache for static assets (${environment} environment)`);
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  // Keep environment-specific caches and delete others
  const cacheWhitelist = [ENVIRONMENT_STATIC_CACHE_NAME, ENVIRONMENT_API_CACHE_NAME];

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Delete caches that don't match the current environment
            if (cacheWhitelist.indexOf(cacheName) === -1) {
              console.log(`Deleting old cache: ${cacheName}`);
              return caches.delete(cacheName);
            }
            return null;
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Helper function to check if a URL matches any pattern in the array
function matchesAnyPattern(url, patterns) {
  return patterns.some((pattern) => pattern.test(url));
}

// Helper function to check if a URL is from a valid domain
function isValidDomain(url) {
  return VALID_DOMAINS.some((domain) => url.includes(domain));
}

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip cross-origin requests that aren't from our valid domains
  if (!isValidDomain(url.hostname)) {
    return;
  }

  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // For HTML requests - use network-first strategy
  if (event.request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Clone the response to store in cache
          const responseToCache = response.clone();
          caches.open(ENVIRONMENT_STATIC_CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // If no cached HTML is found, return the offline page
            return caches.match(`${BASE_PATH}offline.html`);
          });
        })
    );
    return;
  }

  // For API requests - check if they should be cached
  if (url.pathname.includes('/v1/') || url.pathname.includes('/v2/')) {
    // Never cache certain endpoints
    if (matchesAnyPattern(url.pathname, NEVER_CACHE_ENDPOINTS)) {
      // Network-only strategy for endpoints that should never be cached
      event.respondWith(fetch(event.request));
      return;
    }

    // Cache-first strategy for cacheable API endpoints
    if (matchesAnyPattern(url.pathname, CACHEABLE_API_ENDPOINTS)) {
      event.respondWith(
        caches
          .open(ENVIRONMENT_API_CACHE_NAME)
          .then((cache) => {
            return cache.match(event.request).then((cachedResponse) => {
              if (cachedResponse) {
                // Return cached response and update cache in the background
                const fetchPromise = fetch(event.request).then((networkResponse) => {
                  cache.put(event.request, networkResponse.clone());
                  return networkResponse;
                });
                return cachedResponse;
              }

              // If not in cache, fetch from network and cache
              return fetch(event.request).then((networkResponse) => {
                cache.put(event.request, networkResponse.clone());
                return networkResponse;
              });
            });
          })
          .catch(() => {
            // If both cache and network fail, return a generic error response
            return new Response('Network error happened', {
              status: 408,
              headers: { 'Content-Type': 'text/plain' },
            });
          })
      );
      return;
    }

    // For other API requests, use network-first strategy
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(event.request);
      })
    );
    return;
  }

  // For static assets (JS, CSS, images) - use cache-first strategy
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request)
        .then((response) => {
          // Don't cache if not a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response to store in cache
          const responseToCache = response.clone();
          caches.open(ENVIRONMENT_STATIC_CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return response;
        })
        .catch((error) => {
          console.error('Fetch failed:', error);
          // For JavaScript or CSS files, return a fallback
          if (event.request.destination === 'script' || event.request.destination === 'style') {
            return caches.match(BASE_PATH);
          }
          return new Response('Network error happened', {
            status: 408,
            headers: { 'Content-Type': 'text/plain' },
          });
        });
    })
  );
});

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
