# PWA (Progressive Web App) Setup Guide

Copy these files and code snippets to make any website installable as an app.

---

## 1. `public/manifest.json`

```json
{
  "name": "Your App Name",
  "short_name": "App Name",
  "description": "Your app description",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#e94e1b",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/favicon.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/favicon.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

> **Customise**: Change `name`, `short_name`, `description`, `theme_color`, and icon paths.

---

## 2. `public/service-worker.js`

```js
const CACHE_NAME = 'my-app-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/favicon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
```

> **Customise**: Update `CACHE_NAME` and `urlsToCache` with your app's assets.

---

## 3. Add to `index.html` `<head>`

```html
<meta name="theme-color" content="#e94e1b" />
<link rel="manifest" href="/manifest.json" />
<link rel="apple-touch-icon" href="/favicon.png" />
```

> **Customise**: Change `theme-color` and icon path.

---

## 4. Register Service Worker in your entry file (e.g. `src/main.tsx`)

```tsx
// Register service worker for PWA
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((registration) => {
        console.log("SW registered:", registration);
      })
      .catch((error) => {
        console.log("SW registration failed:", error);
      });
  });
}
```

---

## 5. `src/hooks/usePWAInstall.tsx` — Hook to capture install prompt

```tsx
import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstallable(false);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const promptInstall = async () => {
    if (!deferredPrompt) return false;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    setDeferredPrompt(null);
    setIsInstallable(false);

    return outcome === "accepted";
  };

  return { isInstallable, promptInstall };
};
```

---

## 6. `src/components/PWAInstallPrompt.tsx` — Install UI component

```tsx
import { useState } from "react";
import { usePWAInstall } from "@/hooks/usePWAInstall";

export const PWAInstallPrompt = () => {
  const { isInstallable, promptInstall } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState(false);

  if (!isInstallable || isDismissed) return null;

  const handleInstall = async () => {
    const accepted = await promptInstall();
    if (accepted) {
      alert("App installed successfully!");
    }
  };

  return (
    <div style={{
      position: "fixed",
      bottom: "16px",
      right: "16px",
      zIndex: 50,
      maxWidth: "320px",
      background: "white",
      borderRadius: "12px",
      boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
      padding: "16px",
      fontFamily: "sans-serif"
    }}>
      <button
        onClick={() => setIsDismissed(true)}
        style={{ position: "absolute", top: "8px", right: "8px", background: "none", border: "none", cursor: "pointer", fontSize: "18px" }}
      >
        ✕
      </button>
      <h3 style={{ margin: "0 0 4px", fontSize: "16px" }}>📲 Install App</h3>
      <p style={{ margin: "0 0 12px", fontSize: "13px", color: "#666" }}>
        Install for faster access and offline support
      </p>
      <button
        onClick={handleInstall}
        style={{
          width: "100%",
          padding: "10px",
          background: "#e94e1b",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: "bold"
        }}
      >
        Install App
      </button>
    </div>
  );
};
```

> **Note**: This version uses inline styles so it works without Tailwind/shadcn. Adapt styling to your project.

---

## 7. Render the component

Add `<PWAInstallPrompt />` in your main page/layout:

```tsx
import { PWAInstallPrompt } from "./components/PWAInstallPrompt";

function App() {
  return (
    <div>
      {/* Your app content */}
      <PWAInstallPrompt />
    </div>
  );
}
```

---

## Checklist

- [ ] `public/manifest.json` created with your app info
- [ ] `public/service-worker.js` created
- [ ] `index.html` has manifest link, theme-color meta, and apple-touch-icon
- [ ] Service worker registered in entry file
- [ ] `usePWAInstall` hook added
- [ ] `PWAInstallPrompt` component added and rendered
- [ ] App icons (192x192 and 512x512 PNG) in `/public`
- [ ] Serve over HTTPS (required for service workers)

That's it! Your site is now a PWA. 🎉
