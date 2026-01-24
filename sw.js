const CACHE_NAME = 'xenos-builder-v1';
const ASSETS_TO_CACHE = [
  './',
  'index.html',
  'styles.css',
  'manifest.json',
  'Images/WebIcon.png',
  'Images/Core.png',
  'Images/Biotitan.png',
  'Images/Flyer.jpg',
  'Images/Synapse.png',
  'Images/Transport.png',
  'data/faction_rules.json',
  'PDF/MainRules.json',
  'data/armies/tyranids/master.json',
  'data/armies/eldar/master.json',
  'data/armies/orks/master.json',
  // External Libs (Pre-cache so they don't block)
  'https://www.gstatic.com/firebasejs/10.14.0/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.14.0/firebase-auth-compat.js',
  'https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore-compat.js'
];

// Install Event: Cache Core Assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching assets');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate Event: Cleanup Old Caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[SW] Clearing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event: Handle Requests
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. Google Fonts (Stale-While-Revalidate)
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          const fetchPromise = fetch(event.request).then((networkResponse) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // 2. Data/JSON Files (Network First, Fallback to Cache)
  if (url.pathname.endsWith('.json')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // If network success, clone and update cache
          if (response && response.status === 200) {
            const resClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, resClone);
            });
          }
          return response;
        })
        .catch(() => {
          // If network fails, try cache
          return caches.match(event.request);
        })
    );
    return;
  }

  // 3. Static Assets & App Shell (Stale-While-Revalidate)
  // This covers HTML, CSS, JS, Images
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // Update cache with new version if successful
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const resClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, resClone);
          });
        }
        return networkResponse;
      }).catch(err => {
         // Network failed, nothing to do here as we rely on cache
         // console.log('Network fetch failed for', event.request.url);
      });

      // Return cached response immediately if available, else wait for network
      return cachedResponse || fetchPromise;
    })
  );
});
