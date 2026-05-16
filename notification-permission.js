// notification-permission.js
// Suryateja Firebase Web Push + Supabase token saving

let suryatejaFirebaseApp = null;
let suryatejaMessaging = null;
let suryatejaForegroundHandlerAttached = false;

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

function updateSuryatejaNotificationButtonState(buttonId, statusId) {
  const btn = document.getElementById(buttonId);
  const status = document.getElementById(statusId);
  if (!btn || !status) return;

  if (!('Notification' in window)) {
    btn.classList.remove('enabled');
    btn.innerText = 'Notifications Not Supported';
    status.innerText = 'This browser does not support notifications';
    return;
  }

  if (Notification.permission === 'granted') {
    btn.classList.add('enabled');
    btn.innerText = '✅ Notifications Enabled';
    status.innerText = 'Notifications enabled on this browser';
  } else if (Notification.permission === 'denied') {
    btn.classList.remove('enabled');
    btn.innerText = 'Notifications Blocked';
    status.innerText = 'Allow notifications from browser/site settings';
  } else {
    btn.classList.remove('enabled');
    btn.innerText = '🔔 Enable Notifications';
    status.innerText = 'Notifications not enabled';
  }
}

async function initializeSuryatejaForegroundMessaging() {
  try {
    if (!('Notification' in window) || Notification.permission !== 'granted') return false;
    if (!('serviceWorker' in navigator)) return false;
    if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') return false;

    getSuryatejaFirebaseApp();
    suryatejaMessaging = firebase.messaging();

    const swUrl = getServiceWorkerUrl();
    const registration = await navigator.serviceWorker.register(swUrl);
    await navigator.serviceWorker.ready;

    if (!suryatejaForegroundHandlerAttached) {
      suryatejaForegroundHandlerAttached = true;

      suryatejaMessaging.onMessage((payload) => {
        console.log('Foreground Firebase message:', payload);

        const title = payload.notification?.title || payload.data?.title || 'Suryateja Alert';
        const body = payload.notification?.body || payload.data?.body || 'New update received';

        if (Notification.permission === 'granted') {
          const notification = new Notification(title, {
            body,
            icon: new URL('images/logo.jpg', window.location.href).toString(),
            badge: new URL('images/logo.jpg', window.location.href).toString(),
            tag: payload.data?.tag || 'suryateja-alert',
            data: { url: payload?.fcmOptions?.link || payload?.data?.url || window.location.href }
          });

          notification.onclick = function () {
            window.focus();
            const url = payload?.fcmOptions?.link || payload?.data?.url || window.location.href;
            window.location.href = url;
            notification.close();
          };
        }
      });
    }

    return registration;
  } catch (error) {
    console.warn('Foreground messaging auto-init skipped:', error);
    return false;
  }
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

    const registration = await initializeSuryatejaForegroundMessaging();
    if (!registration) {
      throw new Error('Notification permission granted, but Firebase messaging could not initialize.');
    }

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

// Expose helpers for dashboard pages
window.updateSuryatejaNotificationButtonState = updateSuryatejaNotificationButtonState;
window.initializeSuryatejaForegroundMessaging = initializeSuryatejaForegroundMessaging;
window.enableSuryatejaFirebaseNotifications = enableSuryatejaFirebaseNotifications;
