import { readFileSync, writeFileSync } from 'fs';
import isEqual from 'lodash/isEqual.js';
import fetch from 'node-fetch';
import { exit } from 'process';
const sleep = ms => new Promise(r => setTimeout(r, ms));

let datasetDataRequest = await fetch('https://dati.comune.milano.it/api/3/action/package_show?id=ds502_fontanelle-nel-comune-di-milano');
let datasetData = await datasetDataRequest.json();
if(!datasetData.success){
    throw Error('Errore durante il download dei dati');
}
let jsonDatasetResource = datasetData.result.resources.find(res => res.mimetype == 'application/json');
let jsonData = await fetch(jsonDatasetResource.url).then(request => request.json());

let originData = JSON.parse(readFileSync('./origin.json'));

if(isEqual(jsonData, originData)){
    console.log('Nessun aggiornamento necessario');
    exit(0);
}
writeFileSync('./origin.json', JSON.stringify(jsonData), 'utf8');
originData = jsonData;

let processedData = [];
for (const fountain of originData) {
    let params = new URLSearchParams({
        lat: fountain.LAT_Y_4326,
        lon: fountain.LONG_X_4326,
        zoom: 16,
        format: 'jsonv2',
        email: 'milo.maghini@protonmail.com'
    });
    let response = await fetch('https://nominatim.openstreetmap.org/reverse?' + params, { method: 'get', })
    let addressData = await response.json();
    let fountainLocation = {
        long: fountain.LONG_X_4326,
        lat: fountain.LAT_Y_4326,
        address: formatAddress(addressData.address)
    };
    processedData.push(fountainLocation);
    console.log(fountainLocation);
    //Limit rate at max 1 per second as specified in https://operations.osmfoundation.org/policies/nominatim/
    await sleep(1000);
}
writeFileSync('./processed.json', JSON.stringify(processedData), 'utf8');

function formatAddress(address){
    let addressString = '';
    if(address.road && !/^\d+/.test(address.road)){
        addressString += address.road + ', '
    }
    if(address.quarter){
        addressString += address.quarter + ', '
    }
    if(address.postcode){
        addressString += address.postcode + ', '
    }
    if(address.city){
        addressString += address.city
    }
    return addressString;
}