const fs = require('fs');

let originData = JSON.parse(fs.readFileSync('./origin.json'));
let processedData = [];
originData.forEach(fountain => {
    processedData.push({
        long: fountain.LONG_X_4326,
        lat: fountain.LAT_Y_4326
    });
});

try {
    fs.writeFileSync('./processed.json', JSON.stringify(processedData), 'utf8');
    console.log('Data successfully saved to disk');
} catch (error) {
    console.log('An error has occurred ', error);
}