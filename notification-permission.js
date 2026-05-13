// async function enableFirebaseNotifications() {

//   try {

//     const permission =
//       await Notification.requestPermission();

//     if (permission !== "granted") {

//       alert("Notification permission denied");
//       return;
//     }

//     firebase.initializeApp(firebaseConfig);

//     const messaging = firebase.messaging();

//     const token = await messaging.getToken({
//       vapidKey: FIREBASE_VAPID_KEY
//     });

//     console.log("FCM TOKEN:", token);

//     alert("Notifications Enabled");

//   } catch (error) {

//     console.error(error);

//     alert("Notification setup failed");
//   }
// }


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
    throw new Error('firebaseConfig missing. Fill firebase-config.js first.');
  }

  if (!suryatejaFirebaseApp) {
    if (!firebase.apps.length) {
      suryatejaFirebaseApp = firebase.initializeApp(window.firebaseConfig);
    } else {
      suryatejaFirebaseApp = firebase.app();
    }
  }

  return suryatejaFirebaseApp;
}

async function enableSuryatejaFirebaseNotifications(options) {
  const role = options.role;
  const userId = options.userId;
  const mobile = options.mobile || '';
  const companyName = options.companyName || '';
  const buttonId = options.buttonId;
  const statusId = options.statusId;

  try {
    if (!('Notification' in window)) {
      alert('This browser does not support notifications.');
      return;
    }

    if (!('serviceWorker' in navigator)) {
      alert('Service workers are not supported in this browser.');
      return;
    }

    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
      alert('Firebase web notifications need HTTPS hosting. Please test after uploading to Netlify/Vercel/HTTPS domain.');
      return;
    }

    setSuryatejaNotificationStatus(statusId, 'Requesting notification permission...');

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      setSuryatejaNotificationStatus(statusId, 'Notification permission denied');
      alert('Notification permission denied. Please allow notifications in browser settings.');
      return;
    }

    getSuryatejaFirebaseApp();
    suryatejaMessaging = firebase.messaging();

    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

    const token = await suryatejaMessaging.getToken({
      vapidKey: window.FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration
    });

    if (!token) {
      throw new Error('Firebase token not generated.');
    }

    console.log('Suryateja FCM Token:', token);

    if (typeof supabaseClient !== 'undefined') {
      // const payload = {
      //   role: role,
      //   user_id: String(userId || ''),
      //   mobile: String(mobile || ''),
      //   company_name: String(companyName || ''),
      //   fcm_token: token,
      //   platform: 'web',
      //   user_agent: navigator.userAgent,
      //   is_active: true,
      //   updated_at: new Date().toISOString()
      // };
      const payload = {
  user_role: role,
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
        alert('Firebase token created, but Supabase saving failed: ' + error.message);
        return;
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
