// Service Worker для United Crypto Boys
const CACHE_NAME = 'ucb-v1';
const BASE_PATH = '/UCB-SIte-CRYPTO';
const urlsToCache = [
  BASE_PATH + '/',
  BASE_PATH + '/dist/viewer.css',
  BASE_PATH + '/dist/viewer.js',
  BASE_PATH + '/dist/config.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache).catch((error) => {
          console.error('Service Worker: Failed to cache some resources:', error);
          // Продолжаем работу даже если некоторые ресурсы не закэшировались
        });
      })
      .catch((error) => {
        console.error('Service Worker: Cache open failed:', error);
      })
  );
  // Принудительная активация нового Service Worker
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  // Пропускаем запросы, которые не должны кэшироваться
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Пропускаем запросы к внешним ресурсам (кроме наших)
  if (!event.request.url.includes(BASE_PATH) && !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Если есть в кэше, возвращаем из кэша
        if (cachedResponse) {
          return cachedResponse;
        }

        // Иначе загружаем из сети
        return fetch(event.request)
          .then((response) => {
            // Проверяем валидность ответа
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Клонируем ответ для кэширования
            const responseToCache = response.clone();

            // Кэшируем успешные ответы
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache).catch((error) => {
                console.error('Service Worker: Failed to cache response:', error);
              });
            });

            return response;
          })
          .catch((error) => {
            console.error('Service Worker: Fetch failed:', error);
            // Возвращаем fallback для критических ресурсов
            if (event.request.destination === 'script' || 
                event.request.destination === 'style' ||
                event.request.url.includes('/dist/')) {
              // Можно добавить fallback страницу здесь
              return new Response('Resource unavailable (offline)', {
                status: 503,
                statusText: 'Service Unavailable',
                headers: new Headers({
                  'Content-Type': 'text/plain'
                })
              });
            }
            throw error;
          });
      })
      .catch((error) => {
        console.error('Service Worker: Cache match failed:', error);
        // Fallback: пытаемся загрузить из сети
        return fetch(event.request).catch(() => {
          return new Response('Network error', {
            status: 503,
            statusText: 'Service Unavailable'
          });
        });
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_NAME)
            .map((cacheName) => {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        // Включаем новый Service Worker для всех клиентов
        return self.clients.claim();
      })
      .catch((error) => {
        console.error('Service Worker: Activate failed:', error);
      })
  );
});
