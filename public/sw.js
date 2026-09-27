const CACHE = 'rep-quest-v15';
const FILES = ['/art/guide/pushup.webp', '/art/guide/squat.webp', '/art/guide/plank.webp', '/art/guide/superman.webp', '/art/quest/pushup.webp', '/art/quest/squat.webp', '/art/quest/plank.webp', '/art/quest/superman.webp', '/art/regions/forest.webp', '/art/regions/highland.webp', '/art/regions/lake.webp', '/art/regions/ruins.webp', '/art/regions/volcano.webp', '/art/regions/summit.webp', '/art/world-map.webp', '/bestiary.js', '/story.js', '/guide.js', '/worldmap.js', '/sprites/mushroom.webp', '/sprites/wolf.webp', '/sprites/skeleton.webp', '/sprites/wisp.webp', '/sprites/mimic.webp', '/sprites/dragon.webp', '/updates.js', '/app-shell.css', '/battle.js', '/sprites/slime.webp', '/sprites/bat.webp', '/sprites/golem.webp', '/', '/index.html', '/style.css', '/app.js', '/engine.js', '/storage.js', '/sprites.js', '/progression.js', '/motivation.js', '/sprites/sword.webp', '/sprites/mage.webp', '/sprites/rogue.webp', '/sprites/sword-hair.webp', '/sprites/mage-hair.webp', '/sprites/rogue-hair.webp', '/manifest.webmanifest', '/icon-generated-192.png', '/icon-generated-512.png', '/theme.css', '/icon-generated-180.png', '/art/book.svg', '/art/compass.svg', '/art/crest.svg', '/art/guild-dusk.webp', '/art/ornate-frame.svg', '/art/plank.svg', '/art/superman.svg', '/art/pushup.svg', '/art/squat.svg', '/art/wordmark-generated.webp'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)));
});
self.addEventListener('message', event => {
  if (event.data?.type === 'ACTIVATE_UPDATE') event.waitUntil(self.skipWaiting());
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('rep-quest-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  // Keep each installed app shell consistent. An update activates after explicit user action or after old tabs close.
  event.respondWith(caches.open(CACHE).then(async cache => {
    const hit = await cache.match(event.request);
    if (hit) return hit;
    try { return await fetch(event.request); }
    catch { return event.request.mode === 'navigate' ? (await cache.match('/')) || Response.error() : Response.error(); }
  }));
});
