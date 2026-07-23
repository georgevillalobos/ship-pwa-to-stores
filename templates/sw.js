/* Minimal service worker for a PWA.
 * ─────────────────────────────────────────────────────────────────────────
 * CUSTOMIZE (2 things):
 *   1. CACHE  — bump the version string whenever you change a shell file.
 *   2. SHELL  — list the files your app needs to launch offline (your HTML,
 *               your JS bundle, this file's companion pwa.js, manifest, icons).
 * Serve this file at your site ROOT (e.g. https://app.yourdomain.com/sw.js)
 * so its scope covers the whole app. Register it from pwa.js.
 * ───────────────────────────────────────────────────────────────────────── */
const CACHE = "app-shell-v1";                       // 1. bump on shell changes
const SHELL = [                                       // 2. your launch files
  "/index.html",
  "/app.js",
  "/pwa.js",
  "/manifest.webmanifest",
  "/icon-192.png",
  "/icon-512.png",
  "/icon-maskable.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((c) => Promise.allSettled(SHELL.map((u) => c.add(u))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Live data endpoints: always network (let your app handle offline itself).
  // TODO: adjust the prefix to match your API path, or delete this block.
  if (url.pathname.startsWith("/api/")) return;

  // App navigations: network first, fall back to the cached shell so the
  // installed app still opens with no connection. Rebuild redirected responses
  // (a "redirected" response is illegal for the browser to use on a navigation).
  if (req.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const net = await fetch(req);
        if (net.redirected) {
          const body = await net.blob();
          return new Response(body, { status: net.status, statusText: net.statusText, headers: net.headers });
        }
        return net;
      } catch (e) {
        return (await caches.match("/index.html")) || Response.error();
      }
    })());
    return;
  }

  // Everything else: cache-first, then network (and cache what we fetch).
  event.respondWith(
    caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      if (res && res.ok && res.type === "basic") {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
      }
      return res;
    }).catch(() => hit))
  );
});

/* ---- Optional: background Web Push --------------------------------------
 * Wired and ready; only fires once your server sends Web Push messages with a
 * VAPID key. Server payload shape: { title, body, url, tag }. */
self.addEventListener("push", (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; }
  catch (e) { data = { body: event.data ? event.data.text() : "" }; }
  event.waitUntil(self.registration.showNotification(data.title || "Update", {
    body: data.body || "",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    tag: data.tag || "app-notice",
    data: { url: data.url || "/index.html" },
  }));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || "/index.html";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((wins) => {
      for (const w of wins) if (w.url.includes(target) && "focus" in w) return w.focus();
      return self.clients.openWindow ? self.clients.openWindow(target) : undefined;
    })
  );
});
