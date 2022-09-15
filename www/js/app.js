let addressDisplay = document.getElementsByClassName('address')[0];
let goToNavigationButton = document.getElementsByClassName('go-to-navigation')[0];
let selectedFountain;
let currentLocationMarker;
let currentLocationAccuracy;
let followPosition = true;
let fountainIcon = L.icon({
    iconUrl: './images/fountain-marker/marker-icon.png',
    iconSize: [21, 50],
    iconRetinaUrl: './images/fountain-marker/marker-icon-2x.png',
    iconAnchor: [10, 50]
});
let locationIcon = L.icon({
    iconUrl: './images/location-marker/marker-icon.png',
    iconSize: [20, 20],
    iconRetinaUrl: './images/location-marker/marker-icon-2x.png',
    iconAnchor: [10, 10]
});
let map = createMap();

populateMapWithFountains();
map.on('locationfound', displayCurrentPosition);
map.locate({
    setView: false, 
    watch: true,
    enableHighAccuracy: true
});

function displayCurrentPosition(e) {
    console.log(e);
    if(currentLocationMarker && currentLocationAccuracy){
        currentLocationMarker.setLatLng(e.latlng);
        currentLocationAccuracy.setLatLng(e.latlng);
        currentLocationAccuracy.setRadius(e.accuracy);
    }else{
        currentLocationMarker = L.marker(e.latlng, { icon: locationIcon });
        currentLocationAccuracy = L.circle(e.latlng, {radius: e.accuracy});
        currentLocationMarker.addTo(map);
        currentLocationAccuracy.addTo(map);
    }

    if(followPosition){
        map.setView(e.latlng, 17);
    }
}

goToNavigationButton.addEventListener('click', (el, ev) => {
    if (selectedFountain) {
        window.location.href = 'https://www.google.com/maps/dir/?' + new URLSearchParams({
            api: 1,
            destination: selectedFountain.latlng[0] + ',' + selectedFountain.latlng[1]
        });
    }
});

function fountainOnClick(event) {
    selectedFountain = this.data;
    addressDisplay.innerHTML = selectedFountain.address;
    followPosition = false;
    map.setView(selectedFountain.latlng, 17);
}

function populateMapWithFountains() {
    fetch('./data/fountains-locations.json', { method: 'get' })
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
        maxBounds: [
            [45.36, 9],
            [45.57, 9.32]
        ]
    }).setView([45.4642, 9.1900], 13);

    L.tileLayer('./map/tiles/{z}/{x}/{y}.png', {
        maxZoom: 19,
        preferCanvas: true
    }).addTo(map);

    L.control.attribution({ position: 'topright' })
        .addAttribution('&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors')
        .addTo(map);

    return map;
}