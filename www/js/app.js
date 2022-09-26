let addressDisplay = document.getElementsByClassName('address')[0];
let goToNavigationButton = document.getElementsByClassName('go-to-navigation')[0];
let selectedFountainMarker;
let currentLocationMarker;
let currentLocationAccuracy;
let fountainIcon = L.icon({
    iconUrl: './images/fountain-marker/marker-icon.png',
    iconSize: [21, 50],
    iconRetinaUrl: './images/fountain-marker/marker-icon-2x.png',
    iconAnchor: [10, 50]
});
let selectedFountainIcon = L.icon({
    iconUrl: './images/fountain-marker-selected/marker-icon.png',
    iconSize: [40, 70],
    iconRetinaUrl: './images/fountain-marker-selected/marker-icon-2x.png',
    iconAnchor: [20, 70]
});
let locationIcon = L.icon({
    iconUrl: './images/location-marker/marker-icon.png',
    iconSize: [20, 20],
    iconRetinaUrl: './images/location-marker/marker-icon-2x.png',
    iconAnchor: [10, 10]
});
let areaMilano = [
    [45.36, 9],
    [45.57, 9.32]
];
let map = createMap();
let markersLayer;

registerServiceWorker();
populateMapWithFountains()
    .then(markers => {
        map.on('locationfound', displayCurrentPosition);
        map.locate({
            setView: false,
            watch: true,
            enableHighAccuracy: true
        });
        markersLayer = markers;
    });


function isInsideBox(pos, box) {
    return pos[0] > box[0][0] && pos[0] < box[1][0] && pos[1] > box[0][1] && pos[1] < box[1][1];
}

function findClosestFountains(pos, markers){
    let distances = [];
    markers.forEach(marker => {
        let distance = pos.distanceTo(marker.getLatLng());
        distances.push({
            marker,
            distance
        });
    });
    distances.sort((a, b) => {
        return a.distance < b.distance ? -1 : 1;
    });
    return distances[0].marker;
}

function displayCurrentPosition(e) {
    if (!isInsideBox([e.latlng.lat, e.latlng.lng], areaMilano)) {
        alert('Questa applicazione contiene solo le fontanelle all\'interno dell\'area di Milano. Al momento la tua posizione è stata rilevata al di fuori di quest\'area, quindi non verrà mostrata.');
        map.stopLocate();
    }

    if (currentLocationMarker && currentLocationAccuracy) {
        currentLocationMarker.setLatLng(e.latlng);
        currentLocationAccuracy.setLatLng(e.latlng);
        currentLocationAccuracy.setRadius(e.accuracy);
    } else {
        currentLocationMarker = L.marker(e.latlng, { icon: locationIcon });
        currentLocationAccuracy = L.circle(e.latlng, { radius: e.accuracy });
        currentLocationMarker.addTo(map);
        currentLocationAccuracy.addTo(map);
        let closestFountain = findClosestFountains(e.latlng, markersLayer.getLayers());
        fountainOnClick.call(closestFountain, {});
    }
}

goToNavigationButton.addEventListener('click', (el, ev) => {
    if (selectedFountainMarker) {
        window.location.href = 'https://www.google.com/maps/dir/?' + new URLSearchParams({
            api: 1,
            destination: selectedFountainMarker.data.latlng[0] + ',' + selectedFountainMarker.data.latlng[1]
        });
    }
});

function fountainOnClick(event) {
    if (selectedFountainMarker) {
        selectedFountainMarker.setIcon(fountainIcon);
    }
    this.setIcon(selectedFountainIcon);
    selectedFountainMarker = this;
    addressDisplay.innerHTML = this.data.address;
    map.setView(this.data.latlng, 17);
}

function populateMapWithFountains() {
    return fetch('./data/fountains-locations.json', { method: 'get' })
        .then(response => response.json())
        .then(fountainsLocations => {
            var markers = L.markerClusterGroup();
            fountainsLocations.forEach(fountainLocation => {
                let latlng = [
                    fountainLocation.lat,
                    fountainLocation.long
                ];
                let marker = L.marker(latlng, { icon: fountainIcon })
                    .on('click', fountainOnClick);
                marker.data = {
                    address: fountainLocation.address,
                    latlng
                };
                markers.addLayer(marker);
            });
            map.addLayer(markers);
            return markers;
        })
        .catch(err => {
            window.alert('Errore nello scaricare i file necessari al funzionamento dell\'applicazione, riprovare piu tardi');
            console.log(err);
        });
}

function createMap() {
    let map = L.map('map', {
        attributionControl: false,
        maxZoom: 18,
        minZoom: 12,
        maxBounds: areaMilano
    }).setView([45.4642, 9.1900], 13);

    L.tileLayer('./map/tiles/{z}/{x}/{y}.png', {
        maxZoom: 19,
        preferCanvas: true
    }).addTo(map);

    L.control.attribution({ position: 'topright' })
        .addAttribution('&copy; <a href="https://www.openstreetmap.org/copyright" target="blank">OpenStreetMap</a> contributors | <a href="https://github.com/miloleoelia/fontanelle-milano-pwa" target="blank">App credits</a>')
        .addTo(map);

    return map;
}

async function registerServiceWorker(){
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register("serviceworker.js");
        const registration = await navigator.serviceWorker.ready;
        if ('periodicSync' in registration) {
            const status = await navigator.permissions.query({
                name: 'periodic-background-sync',
            });
            if (status.state === 'granted') {
                try {
                    await registration.periodicSync.register('appUpdate', {
                        minInterval: 7 * 24 * 60 * 60 * 1000, // 1 week
                    });
                } catch (e) {
                    console.error(`Periodic background sync failed:\n${e}`);
                }
            }
        }
    }
}