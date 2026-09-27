const CACHE = 'rep-quest-v18';
const FILES = [
  '/art/guide/pushup-knee.webp',
  '/art/guide/pushup-wide.webp',
  '/art/guide/pushup-diamond.webp',
  '/art/guide/pushup-decline.webp',
  '/art/guide/pushup-archer.webp',
  '/art/guide/pushup-onearm-knee.webp',
  '/art/guide/pushup-onearm.webp',
  '/art/guide/pushup-knee-2.webp',
  '/art/guide/pushup-wide-2.webp',
  '/art/guide/pushup-diamond-2.webp',
  '/art/guide/pushup-decline-2.webp',
  '/art/guide/pushup-onearm-knee-2.webp',
  '/art/guide/pushup-onearm-2.webp',
  '/art/guide/pushup-archer-2.webp',
  '/art/guide/squat-half.webp',
  '/art/guide/squat-slow.webp',
  '/art/guide/squat-split.webp',
  '/art/guide/squat-bulgarian.webp',
  '/art/guide/squat-shrimp.webp',
  '/art/guide/squat-pistol-assist.webp',
  '/art/guide/squat-pistol.webp',
  '/art/guide/squat-half-2.webp',
  '/art/guide/plank-knee.webp',
  '/art/guide/plank-leg.webp',
  '/art/guide/plank-reach.webp',
  '/art/guide/plank-long.webp',
  '/art/guide/plank-rkc.webp',
  '/art/guide/superman-arms.webp',
  '/art/guide/superman-y.webp',
  '/art/guide/superman-pulse.webp',
  '/art/guide/superman-swimmer.webp',
  '/art/guide/superman-arch.webp',
  '/art/guide/squat-slow-2.webp',
  '/art/guide/squat-split-2.webp',
  '/art/guide/squat-bulgarian-2.webp',
  '/art/guide/squat-shrimp-2.webp',
  '/art/guide/squat-pistol-assist-2.webp',
  '/art/guide/squat-pistol-2.webp',
'/art/guide/squat-2.webp', '/art/guide/pushup-2.webp', '/art/guide/pushup.webp', '/art/guide/squat.webp', '/art/guide/plank.webp', '/art/guide/superman.webp', '/art/quest/pushup.webp', '/art/quest/squat.webp', '/art/quest/plank.webp', '/art/quest/superman.webp', '/art/regions/forest.webp', '/art/regions/highland.webp', '/art/regions/lake.webp', '/art/regions/ruins.webp', '/art/regions/volcano.webp', '/art/regions/summit.webp', '/art/world-map.webp', '/bestiary.js', '/story.js', '/guide.js', '/share.js', '/techniques.js', '/worldmap.js', '/sprites/mushroom.webp', '/sprites/wolf.webp', '/sprites/skeleton.webp', '/sprites/wisp.webp', '/sprites/mimic.webp', '/sprites/dragon.webp', '/updates.js', '/app-shell.css', '/battle.js', '/sprites/slime.webp', '/sprites/bat.webp', '/sprites/golem.webp', '/', '/index.html', '/style.css', '/app.js', '/engine.js', '/storage.js', '/sprites.js', '/progression.js', '/motivation.js', '/sprites/sword.webp', '/sprites/mage.webp', '/sprites/rogue.webp', '/sprites/sword-hair.webp', '/sprites/mage-hair.webp', '/sprites/rogue-hair.webp', '/manifest.webmanifest', '/icon-generated-192.png', '/icon-generated-512.png', '/theme.css', '/icon-generated-180.png', '/art/book.svg', '/art/compass.svg', '/art/crest.svg', '/art/guild-dusk.webp', '/art/ornate-frame.svg', '/art/plank.svg', '/art/superman.svg', '/art/pushup.svg', '/art/squat.svg', '/art/wordmark-generated.webp'];
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
