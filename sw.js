// Service worker de Mi librería: recibe los avisos y abre el libro al tocarlos
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('push', e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (_) { d = { body: e.data ? e.data.text() : '' }; }
  const scope = self.registration.scope;
  e.waitUntil(self.registration.showNotification(d.title || 'Hay algo nuevo por leer', {
    body: d.body || 'Entra a la librería',
    icon: d.icon || scope + 'icono.png',
    badge: scope + 'icono.png',
    tag: d.tag || 'mi-libreria',
    renotify: true,
    data: { url: d.url || scope }
  }));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || self.registration.scope;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    for (const c of list){
      if (c.url.startsWith(self.registration.scope) && 'focus' in c){
        if ('navigate' in c) c.navigate(url);
        return c.focus();
      }
    }
    return self.clients.openWindow(url);
  }));
});
