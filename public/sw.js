const CACHE = 'rep-quest-v4.1';
const FILES = ['/', '/index.html', '/style.css', '/app.js', '/engine.js', '/storage.js', '/sprites.js', '/progression.js', '/sprites/sword.webp', '/sprites/mage.webp', '/sprites/rogue.webp', '/sprites/sword-hair.webp', '/sprites/mage-hair.webp', '/sprites/rogue-hair.webp', '/manifest.webmanifest', '/icon-generated-192.png', '/icon-generated-512.png', '/theme.css', '/icon-generated-180.png', '/art/book.svg', '/art/compass.svg', '/art/crest.svg', '/art/guild-dusk.webp', '/art/ornate-frame.svg', '/art/plank.svg', '/art/pushup.svg', '/art/squat.svg', '/art/wordmark-generated.webp'];
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
