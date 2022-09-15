const http = require("http");
const fs = require("fs");
const path = require("path");
const os = require('os');
const { parse } = require("path");
const cpuCount = os.cpus().length

//
//  Script from https://paulsmith.tech/post/2020/12/28/creating-map-tiles.html
//  Edited by me
//

// see https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#ECMAScript_.28JavaScript.2FActionScript.2C_etc..29
function lon2tile(lon, zoom) { return (Math.floor((lon + 180) / 360 * Math.pow(2, zoom))); }
function lat2tile(lat, zoom) { return (Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom))); }

if (process.argv.length != 8) {
    console.log("Usage: node get-tiles.js <left> <bottom> <right> <top> <zoom> <outDir>");
    console.log("See: http://tools.geofabrik.de/calc/ - tab \"CD\" - simple copy");
    return;
}

// configure your square here:
var left = parseFloat(process.argv[2]);   // left
var bottom = parseFloat(process.argv[3]); // bottom
var right = parseFloat(process.argv[4]);   // right
var top = parseFloat(process.argv[5]); // top
var layers = process.argv[6];

// 4.21 50.76 4.51 50.95
var outDir = process.argv[7];

var jobs = [];

// helper function to determine which tiles to download (each tile is a job)
const createJobs = (north_edge, west_edge, south_edge, east_edge, z) => {
    var topTile = lat2tile(north_edge, z); // eg.lat2tile(34.422, 9);
    var leftTile = lon2tile(west_edge, z);
    var bottomTile = lat2tile(south_edge, z);
    var rightTile = lon2tile(east_edge, z);
    // var width = Math.abs(leftTile - rightTile) + 1;
    // var height = Math.abs(topTile - bottomTile) + 1;

    var dirZ = path.join(outDir, "" + z);

    // z/x/y
    if (!fs.existsSync(dirZ)) {
        fs.mkdirSync(dirZ);
    }

    for (var x = leftTile; x <= rightTile; x++) {
        var dirX = path.join(outDir, "" + z, "" + x);
        if (!fs.existsSync(dirX)) {
            fs.mkdirSync(dirX);
        }
        for (var y = topTile; y <= bottomTile; y++) {
            var filePath = path.join(outDir, "" + z, "" + x, "" + y + ".png");
            var url = "http://localhost:8080/styles/maptiler-basic/" + z + "/" + x + "/" + y + ".png";
            jobs.push({ filePath, url });
        }
    }
}

// helper function to download a list of jobs
const downloadJob = (i, list) => {
    if (i >= list.length) {
        if (downloaded == jobs.length) {
            console.log(downloaded, "/", jobs.length);
        }
        return;
    }

    var job = list[i];

    const file = fs.createWriteStream(job.filePath);


    var request = http.get(job.url, function (response) {
        downloaded++;
        if (downloaded % 100 == 0) {
            console.log(downloaded, "/", jobs.length);
        }

        response.on("end", () => {
            downloadJob(i + 1, list);
        });
        response.pipe(file);
    });

    request.on('error', function (err) {
        console.log("Failed: ", job.url, job.filePath);
        downloadJob(i + 1, list);
    });

}

console.log("Creating jobs");

// create jobs for each layer
if (layers.indexOf("-") >= 0) {
    var l = layers.split("-");

    if (l.length != 2) {
        return;
    }

    var start = parseInt(l[0]);
    var stop = parseInt(l[1]);

    for (var z = start; z <= stop; z++) {
        console.log("Adding jobs for layer " + z);
        createJobs(top, left, bottom, right, z);
    }
} else if (layers.indexOf(",") >= 0) {
    var l = layers.split(",");
    for (var i = 0; i < l.length; i++) {
        var z = parse(l[i]);
        console.log("Adding jobs for layer " + z);
        createJobs(top, left, bottom, right, z);
    }
} else {
    console.log("Adding jobs for layer " + layers);
    createJobs(top, left, bottom, right, parseInt(layers));
}

console.log("Will download", jobs.length, "tiles into ", outDir);

var downloaded = 0;

// create multiple "threads" to async download tiles
const chunksize = jobs.length / cpuCount;
for (var i = 0; i < jobs.length; i += chunksize) {
    var temparray = jobs.slice(i, i + chunksize);
    downloadJob(0, temparray);
}