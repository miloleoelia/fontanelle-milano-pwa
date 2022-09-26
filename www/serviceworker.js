const appVersion = "1.0";
const appUrlsToCache = [
   "./", "app.webmanifest",
   "js/app.js", "js/leaflet.js", "js/leaflet.markercluster.js",
   "css/app.css", "css/leaflet.css", "css/MarkerCluster.css", "css/MarkerCluster.Default.css",
   "images/fountain-marker/marker-icon-2x.png", "images/fountain-marker/marker-icon.png",
   "images/fountain-marker-selected/marker-icon-2x.png", "images/fountain-marker-selected/marker-icon.png",
   "images/location-marker/marker-icon-2x.png", "images/location-marker/marker-icon.png",
   "fonts/Roboto-Light.ttf", "fonts/Roboto-Medium.ttf",
   "data/fountains-locations.json"
];

self.addEventListener("install", (event) => {
   fetchAndCache(event, appUrlsToCache);
});

self.addEventListener("fetch", event => {
   event.respondWith(
      caches.match(event.request, {ignoreVary: true})
         .then(cachedResponse => {
            return cachedResponse || fetch(event.request);
         })
   )
});

self.addEventListener('periodicsync', (event) => {
   if (event.tag === 'appUpdate') {
     event.waitUntil(fetchAndCache(event, ["data/fountains-locations.json"]));
   }
 });

function fetchAndCache(event, urls) {
   event.waitUntil(
      caches.open("pwa-assets")
         .then(cache => {
            return cache.addAll(urls).catch(e => { console.log(e); });
         })
   );
}

