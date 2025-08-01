const CACHE_NAME = 'plan-vitalidad-v1.0.0'
const STATIC_CACHE = 'static-v1.0.0'
const DYNAMIC_CACHE = 'dynamic-v1.0.0'

// Arquivos essenciais para cache
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/assets/index.js' // Caminho correto para o arquivo JS principal após o build
]

// URLs da API Supabase que devem ser cacheadas
const API_CACHE_PATTERNS = [
  /^https:\/\/.*\.supabase\.co\/rest\/v1\/content/
]

// Instalar service worker
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Service Worker: Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log('Service Worker: Static assets cached')
        return self.skipWaiting()
      })
      .catch(error => {
        console.error('Service Worker: Error caching static assets', error)
      })
  )
})

// Ativar service worker
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...')
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Service Worker: Deleting old cache', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('Service Worker: Activated')
        return self.clients.claim()
      })
  )
})

// Interceptar requisições
self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  // Estratégia Cache First para assets estáticos
  if (STATIC_ASSETS.includes(url.pathname) || request.destination === 'script' || request.destination === 'style') {
    event.respondWith(
      caches.match(request)
        .then(response => {
          return response || fetch(request)
            .then(fetchResponse => {
              return caches.open(STATIC_CACHE)
                .then(cache => {
                  cache.put(request, fetchResponse.clone())
                  return fetchResponse
                })
            })
        })
        .catch(() => {
          // Fallback para página offline se disponível
          if (request.destination === 'document') {
            return caches.match('/')
          }
        })
    )
    return
  }

  // Estratégia Network First para APIs
  if (API_CACHE_PATTERNS.some(pattern => pattern.test(request.url))) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Cache apenas respostas bem-sucedidas
          if (response.status === 200) {
            const responseClone = response.clone()
            caches.open(DYNAMIC_CACHE)
              .then(cache => {
                cache.put(request, responseClone)
              })
          }
          return response
        })
        .catch(() => {
          // Fallback para cache se a rede falhar
          return caches.match(request)
            .then(response => {
              if (response) {
                return response
              }
              // Retorna resposta offline para conteúdo
              return new Response(
                JSON.stringify({
                  error: 'Conteúdo não disponível offline',
                  offline: true
                }),
                {
                  status: 503,
                  statusText: 'Service Unavailable',
                  headers: { 'Content-Type': 'application/json' }
                }
              )
            })
        })
    )
    return
  }

  // Estratégia Network First para outras requisições
  event.respondWith(
    fetch(request)
      .catch(() => {
        // Fallback para cache
        return caches.match(request)
          .then(response => {
            return response || caches.match('/')
          })
      })
  )
})

// Sincronização em background
self.addEventListener('sync', event => {
  console.log('Service Worker: Background sync', event.tag)
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Aqui você pode implementar sincronização de dados
      console.log('Service Worker: Performing background sync')
    )
  }
})

// Notificações push
self.addEventListener('push', event => {
  console.log('Service Worker: Push received', event)
  
  const options = {
    body: event.data ? event.data.text() : 'Nova atualização disponível',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver',
        icon: '/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/icon-192x192.png'
      }
    ]
  }

  event.waitUntil(
    self.registration.showNotification('Plan de Vitalidad', options)
  )
})

// Clique em notificação
self.addEventListener('notificationclick', event => {
  console.log('Service Worker: Notification click', event)
  
  event.notification.close()

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    )
  }
})


