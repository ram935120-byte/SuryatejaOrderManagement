importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

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

  const notificationTitle =
    payload.notification?.title || "Suryateja Alert";

  const notificationOptions = {
    body:
      payload.notification?.body || "New update received",
    icon: "/icon.png"
  };

  self.registration.showNotification(
    notificationTitle,
    notificationOptions
  );
});