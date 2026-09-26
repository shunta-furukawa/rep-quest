const CACHE = 'rep-quest-v2.0';
const FILES = ['/', '/index.html', '/style.css', '/app.js', '/engine.js', '/storage.js', '/scene.js', '/vendor/three.module.js', '/vendor/three.core.js', '/manifest.webmanifest', '/icon.svg', '/icon-192.png', '/icon-512.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('rep-quest-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  // Keep each installed app shell consistent. An update activates after all old tabs close.
  event.respondWith(caches.open(CACHE).then(async cache => {
    const hit = await cache.match(event.request);
    if (hit) return hit;
    try { return await fetch(event.request); }
    catch { return event.request.mode === 'navigate' ? (await cache.match('/')) || Response.error() : Response.error(); }
  }));
});
