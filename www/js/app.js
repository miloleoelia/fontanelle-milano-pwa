let addressDisplay = document.getElementsByClassName('address')[0];
let goToNavigationButton = document.getElementsByClassName('go-to-navigation')[0];
let selectedFountain;
let map = createMap();

populateMapWithFountains(map);


goToNavigationButton.addEventListener('click', (el, ev) => {
    if (selectedFountain) {
        window.location.href = 'https://www.google.com/maps/dir/?' + new URLSearchParams({
            api: 1,
            destination: selectedFountain.latlng[0] + ',' + selectedFountain.latlng[1]
        });
    }
});

function markerOnClick(event) {
    selectedFountain = this.data;
    addressDisplay.innerHTML = selectedFountain.address;
    map.setView(selectedFountain.latlng, 17);
}

function populateMapWithFountains(map) {

    let fountainIcon = L.icon({
        iconUrl: './images/fountain-marker/marker-icon.png',
        iconSize: [21, 50],
        iconRetinaUrl: './images/fountain-marker/marker-icon-2x.png',
        iconAnchor: [10, 50]
    });

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
                    .on('click', markerOnClick);
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
        attributionControl: false
    }).setView([45.4642, 9.1900], 13);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        preferCanvas: true
    }).addTo(map);

    L.control.attribution({ position: 'topright' })
        .addAttribution('&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors')
        .addTo(map);

    return map;
}