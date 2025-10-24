# PWA Setup Documentation

## Overview

Koetori is now a Progressive Web App (PWA)! This means users can install it on their devices for a native app-like experience.

## What's Included

### 1. Service Worker

- **Automatic caching** of static assets (JS, CSS, fonts, images)
- **Offline support** for previously visited pages
- **Network-first strategy** for API calls (Groq, Supabase)
- **Cache-first strategy** for static resources

### 2. Web App Manifest (`/public/manifest.json`)

- App metadata (name, description, colors)
- App icons (192x192, 512x512, maskable variants)
- Standalone display mode (fullscreen app experience)
- App shortcuts (quick action to record a memo)

### 3. iOS Support

- Apple touch icon (180x180)
- `apple-web-app-capable` for standalone mode
- `viewport-fit=cover` for notch/safe area support
- Black translucent status bar

### 4. Install Prompt Component

- **Desktop (Chrome/Edge)**: Shows native install prompt with one-click install
- **iOS Safari**: Shows instructions for manual install via Share → Add to Home Screen
- **Smart timing**: Appears after 30 seconds on iOS (doesn't interrupt immediately)
- **Dismissible**: Users can dismiss and won't see again (stored in localStorage)

### 5. Offline Indicator

- **Real-time detection** of online/offline status
- **Visual feedback**: Orange banner when offline, green when back online
- **Auto-dismiss**: "Back online" message disappears after 3 seconds

## How to Test

### Development

PWA features are **disabled in development mode** to avoid caching issues. To test:

1. Build for production:

   ```bash
   npm run build
   npm start
   ```

2. Open in browser (preferably Chrome or Edge for best PWA support)

3. Test offline mode:
   - Open DevTools → Network tab
   - Check "Offline" checkbox
   - Refresh page - it should still work!

### Production

Deploy to Vercel/production and test:

1. **Chrome/Edge Desktop**: Look for install icon in address bar
2. **iOS Safari**: Test the install instructions banner
3. **Network**: Toggle airplane mode to test offline indicator

## How to Install

### Desktop (Chrome, Edge, Brave)

1. Visit the app
2. Look for the install icon (⊕) in the address bar, OR
3. Wait for the install prompt banner to appear
4. Click "Install App"

### iOS (Safari)

1. Visit the app in Safari
2. Tap the Share button (□↑)
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add"

### Android (Chrome)

1. Visit the app
2. Tap the three dots menu
3. Tap "Install app" or "Add to Home Screen"

## Files Created

### Configuration

- `next.config.ts` - PWA configuration with next-pwa
- `public/manifest.json` - Web app manifest
- `types/next-pwa.d.ts` - TypeScript definitions

### Components

- `app/components/PWAInstallPrompt.tsx` - Install prompt UI
- `app/components/OfflineIndicator.tsx` - Offline status indicator

### Assets

- `public/icon-192.png` - Standard PWA icon
- `public/icon-512.png` - Large PWA icon
- `public/icon-192-maskable.png` - Maskable (adaptive) icon
- `public/icon-512-maskable.png` - Large maskable icon
- `public/apple-touch-icon.png` - iOS home screen icon

### Scripts (Development)

- `scripts/generate-pwa-icons.js` - Icon generation from emoji
- `scripts/generate-png-icons.js` - SVG to PNG conversion

## Caching Strategy

### Network First (with timeout)

- Groq API calls (24 hour cache)
- Supabase API calls
- **Why**: Always try to get fresh data, fall back to cache if offline

### Cache First

- Images (PNG, JPG, SVG, etc.) - 30 days
- Static resources (JS, CSS, fonts) - 30 days
- **Why**: These rarely change, loading from cache is faster

## Updating the App

### For Users

When you deploy new changes:

1. Service worker will detect the update
2. It will download in background
3. Next time user closes and reopens app, new version loads
4. `skipWaiting: true` makes updates apply immediately

### For Developers

- Clear service worker cache: DevTools → Application → Clear storage
- Or: Use incognito/private window for testing
- Or: Build clears old service workers automatically

## Troubleshooting

### PWA not showing install prompt

- Check if already installed (look in app drawer/home screen)
- Try in incognito mode
- Verify manifest.json is accessible: visit `/manifest.json`
- Check DevTools → Application → Manifest for errors

### Offline mode not working

- Check DevTools → Application → Service Workers
- Verify service worker is registered
- Check cache storage in DevTools

### Icons not loading

- Verify PNG files exist in `/public` directory
- Check manifest.json has correct paths
- Try hard refresh (Cmd+Shift+R / Ctrl+Shift+F5)

## Next Steps

Consider adding:

- **Push notifications** (requires paid Apple Developer account for iOS)
- **Background sync** (save memos when offline, sync when online)
- **App shortcuts** (add more quick actions to manifest)
- **Share target** (let users share to your app from other apps)

## Resources

- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [next-pwa GitHub](https://github.com/shadowwalker/next-pwa)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
