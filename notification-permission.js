// notification-permission.js
// Suryateja Firebase Web Push + Supabase token saving

let suryatejaFirebaseApp = null;
let suryatejaMessaging = null;

function setSuryatejaNotificationStatus(statusId, message) {
  const el = document.getElementById(statusId);
  if (el) el.innerText = message;
}

function setSuryatejaNotificationButton(buttonId, enabled) {
  const btn = document.getElementById(buttonId);
  if (!btn) return;
  if (enabled) {
    btn.classList.add('enabled');
    btn.innerText = '✅ Notifications Enabled';
  } else {
    btn.classList.remove('enabled');
    btn.innerText = '🔔 Enable Notifications';
  }
}

function getSuryatejaFirebaseApp() {
  if (!window.firebaseConfig) {
    throw new Error('firebaseConfig missing. Check firebase-config.js.');
  }
  if (!window.FIREBASE_VAPID_KEY) {
    throw new Error('FIREBASE_VAPID_KEY missing. Check firebase-config.js.');
  }
  if (typeof firebase === 'undefined') {
    throw new Error('Firebase scripts are not loaded. Check Firebase script tags.');
  }

  if (!suryatejaFirebaseApp) {
    suryatejaFirebaseApp = firebase.apps.length
      ? firebase.app()
      : firebase.initializeApp(window.firebaseConfig);
  }

  return suryatejaFirebaseApp;
}

function getServiceWorkerUrl() {
  // Works on Netlify root hosting and also GitHub Pages/subfolder hosting.
  return new URL('firebase-messaging-sw.js', window.location.href).toString();
}

async function enableSuryatejaFirebaseNotifications(options) {
  const role = options.role;
  const mobile = options.mobile || '';
  const companyName = options.companyName || '';
  const buttonId = options.buttonId;
  const statusId = options.statusId;

  try {
    if (!('Notification' in window)) {
      alert('This browser does not support notifications. Try Chrome or Edge.');
      return;
    }

    if (!('serviceWorker' in navigator)) {
      alert('Service workers are not supported in this browser.');
      return;
    }

    if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
      alert('Browser push notifications need HTTPS hosting. Use Netlify/Vercel/Firebase Hosting, not file:// or normal http://.');
      return;
    }

    setSuryatejaNotificationStatus(statusId, 'Requesting notification permission...');

    let permission = Notification.permission;
    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }

    if (permission !== 'granted') {
      setSuryatejaNotificationStatus(statusId, 'Notification permission denied');
      alert('Notification permission denied. Enable it from browser site settings and try again.');
      return;
    }

    getSuryatejaFirebaseApp();
    suryatejaMessaging = firebase.messaging();

    const swUrl = getServiceWorkerUrl();
    const registration = await navigator.serviceWorker.register(swUrl);
    await navigator.serviceWorker.ready;

    suryatejaMessaging.onMessage((payload) => {
      console.log('Foreground Firebase message:', payload);
      const title = payload.notification?.title || payload.data?.title || 'Suryateja Alert';
      const body = payload.notification?.body || payload.data?.body || 'New update received';

      if (Notification.permission === 'granted') {
        new Notification(title, {
          body,
          icon: new URL('images/logo.jpg', window.location.href).toString(),
          badge: new URL('images/logo.jpg', window.location.href).toString(),
          data: { url: payload?.fcmOptions?.link || payload?.data?.url || window.location.href }
        });
      }
    });

    const token = await suryatejaMessaging.getToken({
      vapidKey: window.FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration
    });

    if (!token) {
      throw new Error('Firebase token was not generated. Check Firebase Cloud Messaging Web Push certificate/VAPID key.');
    }

    console.log('Suryateja FCM Token:', token);

    if (typeof supabaseClient !== 'undefined') {
      const payload = {
        user_role: String(role || ''),
        mobile: String(mobile || ''),
        company_name: String(companyName || ''),
        fcm_token: token,
        is_active: true,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabaseClient
        .from('user_notification_tokens')
        .upsert(payload, { onConflict: 'fcm_token' });

      if (error) {
        console.error('Supabase token save error:', error);
        throw new Error('FCM token created, but Supabase saving failed: ' + error.message + '. Run FIREBASE_NOTIFICATION_SQL_FIX.sql in Supabase SQL Editor.');
      }
    }

    localStorage.setItem('suryateja_fcm_token_' + role, token);
    setSuryatejaNotificationButton(buttonId, true);
    setSuryatejaNotificationStatus(statusId, 'Ready for Firebase notifications');
    alert('Notifications enabled successfully.');

  } catch (error) {
    console.error('Notification setup failed:', error);
    setSuryatejaNotificationStatus(statusId, 'Notification setup failed');
    alert('Notification setup failed: ' + error.message);
  }
}
