// Version: 2.0.4 (with Caching)
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// --- 1. إعدادات Firebase ---
firebase.initializeApp({
    apiKey: "AIzaSyCXscXexb0bvKEeJ9QKxnrhlB70F0ej7fs",
    authDomain: "arkanat-287ff.firebaseapp.com",
    projectId: "arkanat-287ff",
    storageBucket: "arkanat-287ff.appspot.com",
    messagingSenderId: "773019407626",
    appId: "1:773019407626:web:3b534f6c26c970693b16f3",
    measurementId: "G-81PYGC42FX"
});
const messaging = firebase.messaging();

// --- 2. منطق الإشعارات الخلفية ---
messaging.onBackgroundMessage(payload => {
    console.log('Received background message', payload);
    const notificationTitle = payload.notification.title || 'اشعار جديد';
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/icon-192.png',
        data: { url: payload.fcmOptions?.link || '/' }
    };
    self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(clients.openWindow(event.notification.data.url));
});

// --- 3. منطق التحديث الفوري ---
self.addEventListener('message', event => {
  if (event.data && event.data.action === 'SKIP_WAITING') { self.skipWaiting(); }
});

// --- 4. منطق تفعيل النسخة الجديدة وحذف الكاش القديم ---
self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// =======================================================
// ===     بداية منطق التخزين المؤقت (Caching)         ===
// =======================================================

const CACHE_NAME = 'arkanat-cache-v213';
// قائمة بالملفات الأساسية التي تشكل "هيكل التطبيق"
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/config.js',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// عند "تثبيت" الـ Service Worker، قم بتخزين الملفات الأساسية
self.addEventListener('install', (event) => {
  self.skipWaiting(); // التفعيل الفوري
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching app shell');
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

// عند طلب أي ملف، تحقق أولاً من الـ Cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // إذا وجدنا الملف في الـ Cache، أعده مباشرة
      if (response) {
        return response;
      }
      // إذا لم نجده، اطلبه من الشبكة
      return fetch(event.request);
    })
  );
});
// =======================================================
// ===                   نهاية الإضافة                   ===
// =======================================================