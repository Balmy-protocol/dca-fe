# Mean Finance FE

This repository contains the code for the Mean Finance public web dApp.

## 👨‍💻 Development environment

- Install dependencies

```bash
yarn install
```

- Run locally on port 3000

```bash
yarn start
```

## 🧪 Linting

```bash
yarn lint
```

Will run linter under [src](./src)

## 📱 PWA Features

The application is configured as a Progressive Web App (PWA) with the following features:

- **Offline Support**: The app can be used offline with cached assets and data
- **Installable**: Users can install the app on their devices
- **Automatic Updates**: The app notifies users when updates are available
- **Responsive Design**: Works on all devices and screen sizes
- **Multi-Environment Support**: Works across all environments (production, staging, dev, adhoc)
- **Path-Independent**: Automatically detects the base path, no configuration needed
- **App Shortcuts**: Quick access to key features through home screen shortcuts
- **Comprehensive Manifest**: Complete PWA manifest with all recommended fields
- **Smart Launch Handling**: Controls how the app launches when links are clicked
- **Cross-Origin Support**: Works across multiple domains with scope extensions

### Web App Manifest

The PWA manifest (`public_metadata/site.webmanifest`) includes:

- Basic information: name, short_name, description
- Unique app ID for identification across platforms
- Icons in various sizes with both "any" and "maskable" purpose support
- Display preferences: standalone mode, orientation
- Navigation: start_url, scope, and scope_extensions for cross-origin support
- Launch handler for controlling how the app opens from links
- Metadata: language, categories
- Screenshots for app stores
- Home screen shortcuts for quick access to key features

### Service Worker

The service worker (`public/service-worker.js`) implements the following caching strategies:

- **Static Assets**: Cache-first strategy for static files (JS, CSS, images)
- **HTML Pages**: Network-first strategy with offline fallback
- **API Requests**: Selective caching based on endpoint type:
  - Read-only endpoints: Cache-first with background updates
  - Write operations: Network-only (never cached)

#### Environment-Specific Caching

The service worker automatically detects the current environment based on the hostname:

- Production: app.balmy.xyz
- Staging: staging.app.balmy.xyz
- Development: dev.app.balmy.xyz
- Ad-hoc: adhoc.app.balmy.xyz

Each environment uses its own separate cache to prevent cross-environment contamination. This ensures that:

- Updates in one environment don't affect others
- Testing in development or staging doesn't pollute production caches
- Each environment maintains its own offline capabilities

#### Path Detection

The service worker automatically detects its base path from its own location, eliminating the need for the PUBLIC_URL variable. This makes deployment more flexible and works correctly regardless of where the app is hosted (root path or subdirectory).

### Testing PWA Features

To test the PWA features:

1. Build the application: `yarn build`
2. Serve the built files: `npx serve -s dist`
3. Open Chrome DevTools > Application tab > Service Workers to see the registered service worker
4. Use the "Offline" checkbox in DevTools to simulate offline mode
5. To test environment-specific caching, access the app through different hostnames
6. To test installation, click the install icon in the browser's address bar
7. To test shortcuts, install the app and right-click on its icon (desktop) or long-press (mobile)
8. To test launch handling, open the app and then click links to the app from other tabs

## 📖 Docs

Check our docs at [docs.balmy.xyz](https://docs.balmy.xyz)
