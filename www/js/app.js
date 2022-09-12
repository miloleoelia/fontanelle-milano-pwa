let addressDisplay = document.getElementsByClassName('address')[0];
let selectedFountain;
let map = createMap();

populateMapWithFountains(map);

function markerOnClick(event){
    selectedFountain = this.data;
    addressDisplay.innerHTML = selectedFountain.address;
    map.setView(selectedFountain.latlng, 17)
}

function populateMapWithFountains(map) {
    fetch('./data/fountains-locations.json', { method: 'get' })
        .then(response => response.json())
        .then(fountainsLocations => {
            var markers = L.markerClusterGroup();
            fountainsLocations.forEach(fountainLocation => {
                let latlng = [
                    fountainLocation.lat,
                    fountainLocation.long
                ];
                let marker = L.marker(latlng).on('click', markerOnClick);
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