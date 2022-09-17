const urlsToCache = [
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
   event.waitUntil(
      caches.open("pwa-assets")
         .then(cache => {
            return cache.addAll(urlsToCache).catch(e => {console.log(e)})
         })
   );
});
self.addEventListener("fetch", event => {
   event.respondWith(
      caches.match(event.request, {ignoreVary: true})
         .then(cachedResponse => {
            // It can update the cache to serve updated content on the next request
            return cachedResponse || fetch(event.request);
         }
         )
   )
});
