// This file is intentionally left blank for now.
// We will add service worker logic here in the next steps.
console.log("Hello from the service worker!");

const CACHE_NAME = "offline-article-viewer-v2"; // Bump version to trigger update
const DATA_CACHE_NAME = "article-data-cache-v1";

// This list of files will be cached when the service worker is installed.
const urlsToCache = [
  "/",
  "/index.html",
  "/manifest.json",
  "/favicon.ico",
  "/logo192.png",
  // Note: The paths for JS and CSS bundles can change. In a real production app,
  // a build tool would inject the correct paths here. We are using the default paths
  // for a standard create-react-app build for this demo.
  "/static/js/bundle.js",
  "/static/css/main.chunk.css", // These paths might vary
  "/static/js/main.chunk.js", // depending on the build
];

// The 'install' event is fired when the service worker is first installed.
self.addEventListener("install", (event) => {
  console.log("[Service Worker] Install event in progress.");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Service Worker] Caching App Shell");
      return cache.addAll(urlsToCache);
    })
  );
});

// The 'activate' event is useful for cleaning up old caches.
self.addEventListener("activate", (event) => {
  console.log("[Service Worker] Activate event in progress.");
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
            console.log("[Service Worker] Removing old cache", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// The 'fetch' event is fired for every network request the page makes.
self.addEventListener("fetch", (event) => {
  console.log("[SW] Fetching:", event.request.url);

  if (event.request.url.includes("dummyjson.com/posts")) {
    console.log("[SW] Handling API fetch");
    // Use a static key for the API cache so we can always serve the last fetched data.
    const API_CACHE_KEY = "latest-posts";

    event.respondWith(
      caches.open(DATA_CACHE_NAME).then((cache) => {
        return fetch(event.request, { cache: "no-store" })
          .then((response) => {
            if (!response.ok) {
              // If the response is not ok, pass it through without modification.
              return response;
            }

            console.log("[SW] Got from network, shuffling response...");

            // Read the response body as JSON to modify it.
            return response.json().then((data) => {
              // --- Shuffle Logic ---
              if (data && data.posts) {
                let posts = data.posts;
                let currentIndex = posts.length,
                  randomIndex;
                // Fisher-Yates shuffle algorithm
                while (currentIndex != 0) {
                  randomIndex = Math.floor(Math.random() * currentIndex);
                  currentIndex--;
                  [posts[currentIndex], posts[randomIndex]] = [
                    posts[randomIndex],
                    posts[currentIndex],
                  ];
                }
              }
              // --- End of Shuffle Logic ---

              // Create a new response with the shuffled data
              const newHeaders = new Headers(response.headers);
              newHeaders.set("Content-Type", "application/json");
              newHeaders.set("X-Source", "network");

              const shuffledResponse = new Response(JSON.stringify(data), {
                status: response.status,
                statusText: response.statusText,
                headers: newHeaders,
              });

              // Cache the shuffled response and return it to the app
              cache.put(API_CACHE_KEY, shuffledResponse.clone());
              return shuffledResponse;
            });
          })
          .catch((err) => {
            console.log("[SW] Fetch failed, serving from cache", err);
            // When fetch fails, look for the static key in the cache.
            return cache.match(API_CACHE_KEY).then((cachedResponse) => {
              if (cachedResponse) {
                const newHeaders = new Headers(cachedResponse.headers);
                newHeaders.set("X-Source", "cache");

                return new Response(cachedResponse.body, {
                  status: cachedResponse.status,
                  statusText: cachedResponse.statusText,
                  headers: newHeaders,
                });
              }
              return undefined;
            });
          });
      })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
