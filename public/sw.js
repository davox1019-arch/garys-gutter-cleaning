/**
 * Service worker for enquiry alerts.
 *
 * Pushes arrive with no payload, so the notification is deliberately generic —
 * it says an enquiry came in, not whose it is. That keeps customer details
 * off a lock screen, and means no message encryption is needed to send one.
 */

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('push', (event) => {
  event.waitUntil(
    self.registration.showNotification('New enquiry', {
      body: 'Someone wants a price — tap to open and reply.',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      // One tag means a second request replaces the first rather than stacking.
      tag: 'enquiry',
      renotify: true,
      requireInteraction: true,
      data: { url: '/quote-admin/' },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || '/quote-admin/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) => {
      // Re-use the admin tab if it's already open rather than piling up new ones.
      for (const client of windows) {
        if (client.url.indexOf(target) !== -1 && 'focus' in client) return client.focus();
      }
      return self.clients.openWindow(target);
    })
  );
});
