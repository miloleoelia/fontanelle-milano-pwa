import { readFileSync, writeFileSync } from 'fs';
import fetch from 'node-fetch';
const sleep = ms => new Promise(r => setTimeout(r, ms));

let originData = JSON.parse(readFileSync('./origin.json'));
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

try {
    writeFileSync('./processed.json', JSON.stringify(processedData), 'utf8');
    console.log('Data successfully saved to disk');
} catch (error) {
    console.log('An error has occurred ', error);
}

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