/* MEVTENCIA Service Worker
   - Cache-first for app shell (HTML/CSS/JS/images)
   - Offline fallback for navigations
   - Works with Netlify/Vercel/GitHub Pages
*/

const SW_VERSION = "mevtencia-pwa-v1.0.0";
const APP_SHELL_CACHE = `mevtencia-shell-${SW_VERSION}`;
const RUNTIME_CACHE = `mevtencia-runtime-${SW_VERSION}`;

// Update this list when you add/remove files.
const PRECACHE_URLS = [
  "./",
  "./index.html",
  "./offline.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",

  "./adminLogin.html",
  "./AdminControlPanel.html",
  "./mev.html",
  "./EmployeeProfile.html",
  "./AttendenceTracker.html",
  "./resultList.html",
  "./logout.html",
  "./Registrations.html",
  "./Profile.html",
  "./mevten.html"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(APP_SHELL_CACHE).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.map((key) => {
          if (key !== APP_SHELL_CACHE && key !== RUNTIME_CACHE) return caches.delete(key);
          return undefined;
        })
      );
      await self.clients.claim();
    })()
  );
});

function isNavigationRequest(request) {
  return request.mode === "navigate" || (request.method === "GET" && request.headers.get("accept")?.includes("text/html"));
}

function isSameOrigin(request) {
  return new URL(request.url).origin === self.location.origin;
}

// Cache-first for same-origin static assets; runtime cache for other GETs.
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only handle GET
  if (request.method !== "GET") return;

  // Offline fallback for navigations
  if (isNavigationRequest(request)) {
    event.respondWith(
      (async () => {
        try {
          // Try cache first (fast + offline)
          const cached = await caches.match(request);
          if (cached) return cached;

          // Otherwise go network and cache it
          const fresh = await fetch(request);
          const cache = await caches.open(RUNTIME_CACHE);
          cache.put(request, fresh.clone());
          return fresh;
        } catch (e) {
          return caches.match("./offline.html");
        }
      })()
    );
    return;
  }

  // For same-origin assets: cache-first (best offline UX)
  if (isSameOrigin(request)) {
    event.respondWith(
      (async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        try {
          const fresh = await fetch(request);
          const cache = await caches.open(RUNTIME_CACHE);
          cache.put(request, fresh.clone());
          return fresh;
        } catch (e) {
          // If asset missing, just fail (browser will show broken image, etc.)
          return cached;
        }
      })()
    );
    return;
  }

  // For cross-origin (e.g. reverse geocoding API): network-first with cache fallback
  event.respondWith(
    (async () => {
      try {
        const fresh = await fetch(request);
        const cache = await caches.open(RUNTIME_CACHE);
        cache.put(request, fresh.clone());
        return fresh;
      } catch (e) {
        const cached = await caches.match(request);
        if (cached) return cached;
        throw e;
      }
    })()
  );
});

