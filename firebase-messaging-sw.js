importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyChlYvnp_-Bc3kM9rP9Kk2YZUWoDPvG0Pk",
  authDomain: "suryateja-order-management.firebaseapp.com",
  projectId: "suryateja-order-management",
  storageBucket: "suryateja-order-management.firebasestorage.app",
  messagingSenderId: "717132737583",
  appId: "1:717132737583:web:ff348505e85c4fe049aada"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Background message', payload);

  const notificationTitle =
    payload.notification?.title ||
    payload.data?.title ||
    'Suryateja Notification';

  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || 'New update received',
    icon: './images/logo.jpg',
    badge: './images/logo.jpg',
    data: {
      url: payload?.fcmOptions?.link || payload?.data?.url || self.location.origin
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const targetUrl = event.notification.data?.url || self.location.origin;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (const client of clientList) {
        if (client.url === targetUrl && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});
