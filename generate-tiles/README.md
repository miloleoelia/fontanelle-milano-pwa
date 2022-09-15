# Instructions

1. Download OSM data from a provider like [Geofabrik](https://download.geofabrik.de/) or if you are lucky and your project is not commercial from [MapTiler](https://data.maptiler.com/downloads/planet/)
2. Use a tool to know the BBox corners of the area that you want [Geofabrik calc](https://tools.geofabrik.de/calc/)
3. Cut the area you want to use with tool like [Osmium tool](https://github.com/osmcode/osmium-tool)
```
sudo apt-get install osmium-tool
osmium extract --bbox=9,45.36,9.32,45.57 --set-bounds --strategy=smart europe-latest.osm.pbf  --output milan.osm.pbf
```
4. Install/compile [Tilemaker](https://github.com/systemed/tilemaker)
```
sudo apt install build-essential libboost-dev libboost-filesystem-dev libboost-iostreams-dev libboost-program-options-dev libboost-system-dev liblua5.1-0-dev libprotobuf-dev libshp-dev libsqlite3-dev protobuf-compiler rapidjson-dev
git clone https://github.com/systemed/tilemaker.git
cd tilemaker
make
```
5. Use tilemaker to create a '.mbtiles' rapresentation of the area
```
tilemaker --input milan.osm.pbf --output milan.mbtiles --process resources/process-openmaptiles.lua --config resources/config-openmaptiles.json 
```
6. Set up a server for the tiles, for exaple [Tileserver-gl](https://github.com/maptiler/tileserver-gl). Copy your styles in the style folder
```
docker run --rm -it -v $(pwd)/style/:/app/node_modules/tileserver-gl-styles/styles/ -v $(pwd):/data -p 8080:80 maptiler/tileserver-gl
```
7. Use the get-tiles.js script to download the tiles (adjust with the right url)
```
node get-tiles.js 9 45.36 9.32 45.57 8-18 ./tiles/
```
8. Add the tiles to /map/tiles/ under the www folder, you can do that with a system link
```
ln -s -r ../generate-tiles/tiles/ ./map/tiles
```