const CACHE_NAME = "listly-shell-v1";
const APP_SHELL = [
    "./",
    "./index.html",
    "./service-worker.js",
    "./css/reset.css",
    "./css/css-variables.css",
    "./css/style.css",
    "./js/main.js",
    "./js/i18n.js",
    "./js/localstorage.js",
    "./assets/manifest.json",
    "./assets/Lang/en.json",
    "./assets/Lang/ar.json",
    "./assets/fonts/ArefRuqaa-Regular.ttf",
    "./assets/fonts/Lemonada-Regular.ttf",
    "./assets/fonts/Pacifico-Regular.ttf",
    "./assets/fonts/SpaceGrotesk-Regular.ttf",
    "./assets/icons/icon-192-re.png",
    "./assets/icons/icon-192.png",
    "./assets/icons/icon-512-re.png",
    "./assets/icons/icon-512.png",
    "./assets/icons/remove.svg",
    "./assets/icons/setting.png",
    "./assets/images/background.jpg",
    "./assets/images/backgroundDark.jpg",
    "./assets/sounds/clearAll.wav",
    "./assets/sounds/delete.mp3",
    "./assets/sounds/done.wav",
    "./assets/sounds/erorr.wav",
    "./assets/sounds/startTask.wav"
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(APP_SHELL))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => Promise.all(
                cacheNames
                    .filter((cacheName) => cacheName !== CACHE_NAME)
                    .map((cacheName) => caches.delete(cacheName))
            ))
            .then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", (event) => {
    if (event.request.method !== "GET") return;

    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                if (cachedResponse) return cachedResponse;

                return fetch(event.request).catch(() => {
                    if (event.request.mode === "navigate") {
                        return caches.match("./index.html");
                    }
                    return Response.error();
                });
            })
    );
});
