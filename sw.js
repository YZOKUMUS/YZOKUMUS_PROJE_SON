// Hasene Service Worker - Offline + Cache
const CACHE_NAME = 'hasene-v6';
const DATA_CACHE_NAME = 'hasene-data-v6';

const urlsToCache = [
    './',
    './index.html',
    './style.css',
    './manifest.json',
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

// Install Event
self.addEventListener('install', (event) => {
    event.waitUntil(
        Promise.all([
            caches.open(CACHE_NAME).then(async (cache) => {
                console.log('Caching app shell');
                // Tek tek ekle - bir dosya başarısız olsa bile diğerleri cache'lensin
                const cachePromises = urlsToCache.map(url => {
                    return fetch(url).then(response => {
                        if (response.ok) {
                            return cache.put(url, response);
                        } else {
                            console.warn(`Failed to cache: ${url} (${response.status})`);
                        }
                    }).catch(err => {
                        console.warn(`Error caching ${url}:`, err);
                    });
                });
                await Promise.allSettled(cachePromises);
            }),
            caches.open(DATA_CACHE_NAME).then(async (cache) => {
                console.log('Caching data files');
                // Tek tek ekle - bir dosya başarısız olsa bile diğerleri cache'lensin
                const cachePromises = dataUrlsToCache.map(url => {
                    return fetch(url).then(response => {
                        if (response.ok) {
                            return cache.put(url, response);
                        } else {
                            console.warn(`Failed to cache: ${url} (${response.status})`);
                        }
                    }).catch(err => {
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

// Fetch Event
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Data files - Cache First, then Network
    // Sadece GET isteklerini cache'le (POST, PUT, DELETE desteklenmiyor)
    if (url.pathname.includes('/data/') && event.request.method === 'GET') {
        event.respondWith(
            caches.open(DATA_CACHE_NAME).then((cache) => {
                return cache.match(event.request).then((response) => {
                    const fetchPromise = fetch(event.request).then((networkResponse) => {
                        // Sadece başarılı GET isteklerini cache'le
                        if (networkResponse && networkResponse.status === 200) {
                            cache.put(event.request, networkResponse.clone());
                        }
                        return networkResponse;
                    }).catch(() => response);

                    return response || fetchPromise;
                });
            })
        );
        return;
    }
    
    // POST/PUT/DELETE gibi non-GET istekleri direkt network'e git
    if (event.request.method !== 'GET') {
        event.respondWith(fetch(event.request));
        return;
    }

    // App shell - Cache First
    // Buraya sadece GET istekleri gelir (non-GET istekleri yukarıda handle edildi)
    event.respondWith(
        caches.match(event.request).then((response) => {
            if (response) {
                return response;
            }
            return fetch(event.request).then((networkResponse) => {
                // Sadece başarılı GET isteklerini cache'le
                if (networkResponse && networkResponse.status === 200) {
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                return networkResponse;
            });
        }).catch(() => {
            // Offline fallback
            if (event.request.destination === 'document') {
                return caches.match('./index.html');
            }
        })
    );
});
