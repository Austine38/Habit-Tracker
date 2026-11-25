
/* HabitDash PWA service worker.
   Keep this file, the webmanifest, icons and HTML in the same HTTPS folder. */

const CACHE_NAME = "habitdash-shell-v3";
const APP_FILE = "./index.html";

const SHELL_FILES = [
  APP_FILE,
  "./habitdash.webmanifest",
  "./habitdash-icon.svg",

  // PWA application icons
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",

  // Browser and Apple icons
  "./icons/apple-touch-icon.png",
  "./icons/favicon.ico",
  "./icons/favicon-16.png",
  "./icons/favicon-32.png",
  "./icons/favicon-48.png"
];

const CACHEABLE_CDNS = new Set([
  "cdn.jsdelivr.net",
  "fonts.googleapis.com",
  "fonts.gstatic.com"
]);

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    const urls = SHELL_FILES.map(path =>
      new URL(path, self.registration.scope).href
    );

    await cache.addAll(urls);
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const names = await caches.keys();

    await Promise.all(
      names
        .filter(name =>
          name.startsWith("habitdash-shell-") &&
          name !== CACHE_NAME
        )
        .map(name => caches.delete(name))
    );

    await self.clients.claim();
  })());
});

self.addEventListener("fetch", event => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Never cache authenticated Supabase requests or personal account responses.
  if (url.hostname.endsWith(".supabase.co")) return;

  if (url.origin === self.location.origin && request.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);

        if (response && response.ok) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(request, response.clone()).catch(() => {});
        }

        return response;
      } catch (error) {
        const cached = await caches.match(request);

        if (cached) return cached;

        const app = await caches.match(
          new URL(APP_FILE, self.registration.scope).href
        );

        if (app) return app;

        throw error;
      }
    })());

    return;
  }

  const isSameOriginAsset =
    url.origin === self.location.origin &&
    (
      ["script", "style", "image", "font"].includes(request.destination) ||
      url.pathname.endsWith(".webmanifest")
    );

  const isCdnAsset = CACHEABLE_CDNS.has(url.hostname);

  if (isSameOriginAsset || isCdnAsset) {
    event.respondWith((async () => {
      const cached = await caches.match(request);

      if (cached) {
        fetch(request)
          .then(async response => {
            if (response && (response.ok || response.type === "opaque")) {
              const cache = await caches.open(CACHE_NAME);
              await cache.put(request, response.clone());
            }
          })
          .catch(() => {});

        return cached;
      }

      try {
        const response = await fetch(request);

        if (response && (response.ok || response.type === "opaque")) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(request, response.clone());
        }

        return response;
      } catch (error) {
        return new Response(
          "This resource is not cached yet. Reconnect and reload HabitDash once.",
          {
            status: 503,
            headers: {
              "Content-Type": "text/plain; charset=utf-8"
            }
          }
        );
      }
    })());
  }
});
