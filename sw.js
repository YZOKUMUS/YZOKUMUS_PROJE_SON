// Hasene Service Worker - Offline + otomatik güncelleme
// Yeni sürüm yayınlarken CACHE_NAME sürümünü artır (ör. hasene-v8)
const CACHE_NAME = 'hasene-v11';
const DATA_CACHE_NAME = 'hasene-data-v11';

const urlsToCache = [
    './',
    './index.html',
    './style.css',
    './manifest.json',
    './privacy.html',
    './ASSETS/badges/icon-192.png',
    './js/config.js',
    './js/constants.js',
    './js/utils.js',
    './js/firebase-config.js',
    './js/firebase-init.js',
    './js/auth.js',
    './js/api-service.js',
    './js/data-loader.js',
    './js/points-manager.js',
    './js/leaderboard.js',
    './js/notifications.js',
    './js/charts.js',
    './js/juz-journey.js',
    './js/pwa-install.js',
    './js/game-core.js',
    './js/pronunciation-fix.js',
    './ASSETS/badges/icon-512.png',
    './ASSETS/fonts/KFGQPC Uthmanic Script HAFS Regular.otf'
];

const dataUrlsToCache = [
    './data/kelimebul.json',
    './data/ayetoku.json',
    './data/duaet.json',
    './data/hadisoku.json',
    './data/harf.json'
];

function networkFirst(request, cacheName) {
    return fetch(request)
        .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
                const clone = networkResponse.clone();
                caches.open(cacheName).then((cache) => cache.put(request, clone));
            }
            return networkResponse;
        })
        .catch(() => caches.match(request).then((cached) => {
            if (cached) return cached;
            return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
        }));
}

function cacheFirst(request, cacheName) {
    return caches.match(request).then((response) => {
        if (response) {
            return response;
        }
        return fetch(request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
                const clone = networkResponse.clone();
                caches.open(cacheName).then((cache) => cache.put(request, clone));
            }
            return networkResponse;
        });
    });
}

function isNetworkFirstPath(pathname) {
    if (pathname.endsWith('sw.js')) {
        return true;
    }
    if (pathname.endsWith('/') || pathname.endsWith('.html')) {
        return true;
    }
    if (pathname.endsWith('.js') || pathname.endsWith('.css')) {
        return true;
    }
    return false;
}

// Install Event
self.addEventListener('install', (event) => {
    event.waitUntil(
        Promise.all([
            caches.open(CACHE_NAME).then(async (cache) => {
                console.log('Caching app shell');
                const cachePromises = urlsToCache.map((url) => {
                    return fetch(url).then((response) => {
                        if (response.ok) {
                            return cache.put(url, response);
                        }
                        console.warn(`Failed to cache: ${url} (${response.status})`);
                    }).catch((err) => {
                        console.warn(`Error caching ${url}:`, err);
                    });
                });
                await Promise.allSettled(cachePromises);
            }),
            caches.open(DATA_CACHE_NAME).then(async (cache) => {
                console.log('Caching data files');
                const cachePromises = dataUrlsToCache.map((url) => {
                    return fetch(url).then((response) => {
                        if (response.ok) {
                            return cache.put(url, response);
                        }
                        console.warn(`Failed to cache: ${url} (${response.status})`);
                    }).catch((err) => {
                        console.warn(`Error caching ${url}:`, err);
                    });
                });
                await Promise.allSettled(cachePromises);
            })
        ])
    );
    self.skipWaiting();
});

// Activate Event
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME && cacheName !== DATA_CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// Fetch Event
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    if (event.request.method !== 'GET') {
        event.respondWith(fetch(event.request));
        return;
    }

    if (url.origin !== self.location.origin) {
        event.respondWith(fetch(event.request));
        return;
    }

    // Data files - cache first, arka planda ağdan güncelle
    if (url.pathname.includes('/data/')) {
        event.respondWith(
            caches.open(DATA_CACHE_NAME).then((cache) => {
                return cache.match(event.request).then((cached) => {
                    const networkFetch = fetch(event.request).then((networkResponse) => {
                        if (networkResponse && networkResponse.status === 200) {
                            cache.put(event.request, networkResponse.clone());
                        }
                        return networkResponse;
                    });

                    if (cached) {
                        networkFetch.catch(() => {});
                        return cached;
                    }

                    return networkFetch.catch(() => new Response(
                        JSON.stringify({ error: 'Offline and not cached' }),
                        { status: 503, headers: { 'Content-Type': 'application/json' } }
                    ));
                });
            })
        );
        return;
    }

    // HTML / JS / CSS — önce ağ (otomatik güncelleme)
    if (isNetworkFirstPath(url.pathname)) {
        event.respondWith(networkFirst(event.request, CACHE_NAME));
        return;
    }

    // Görseller, fontlar — önbellek öncelikli (offline)
    event.respondWith(
        cacheFirst(event.request, CACHE_NAME).catch(() => {
            if (event.request.destination === 'document') {
                return caches.match('./index.html');
            }
        })
    );
});
