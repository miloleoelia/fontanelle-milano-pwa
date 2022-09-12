var map = L.map('map', {
    attributionControl: false
}).setView([45.4642, 9.1900], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    preferCanvas: true
}).addTo(map);

L.control.attribution({ position: 'topright' })
    .addAttribution('© OpenStreetMap')
    .addTo(map);

fetch('./data/fountains-locations.json', {
    method: 'get'
})
    .then(response => response.json())
    .then(fountainsLocations => {
        var markers = L.markerClusterGroup();
        fountainsLocations.forEach(fountainLocation => {
            markers.addLayer(
                L.marker([
                    fountainLocation.lat,
                    fountainLocation.long
                ])
            );
        });
        map.addLayer(markers);
    })
    .catch(err => {
        window.alert('Errore nello scaricare i file necessari al funzionamento dell\'applicazione, riprovare piu tardi');
        console.log(err);
    });