// Initialize leaflet.js
var L = require("leaflet");

//const GeoTIFF = require("geotiff");
//const { fromUrl, fromUrls, fromArrayBuffer, fromBlob } = GeoTIFF;

var GeoRasterLayer = require("georaster-layer-for-leaflet");
var parse_georaster = require("georaster");

// Set the position and zoom level of the map
//map.setView([47.7, 13.35], 7);

var streets = L.tileLayer(
  "https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=tCyoQSYikz7pcOQ5XQgt",
  {
    attribution:
      '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>',
  }
);
var satellite = L.tileLayer(
  "https://api.maptiler.com/maps/satellite/{z}/{x}/{y}.jpg?key=tCyoQSYikz7pcOQ5XQgt",
  {
    attribution:
      '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>',
  }
);

var imageUrl = "https://maps.lib.utexas.edu/maps/historical/newark_nj_1922.jpg";
var errorOverlayUrl = "https://cdn-icons-png.flaticon.com/512/110/110686.png";
var altText =
  "Image of Newark, N.J. in 1922. Source: The University of Texas at Austin, UT Libraries Map Collection.";
var latLngBounds = L.latLngBounds([
  [40.799311, -74.118464],
  [40.68202047785919, -74.33],
]);

var imageOverlay = L.imageOverlay(imageUrl, latLngBounds, {
  opacity: 0.8,
  errorOverlayUrl: errorOverlayUrl,
  alt: altText,
  interactive: true,
});

var marker = L.marker([-3.0003737182143184, 60.33378043305085]);

var map = L.map("map", {
  center: [39.73, -104.99],
  zoom: 10,
  layers: [streets, marker],
  scrollWheelZoom: true,
});

var baseMaps = {
  OpenStreetMap: streets,
  Satellite: satellite,
};

var overlayMaps = {
  marker: marker,
  image: imageOverlay,
  //sentinel: layer,
};

var layerControl = L.control
  .layers(baseMaps, overlayMaps, { collapsed: false })
  .addTo(map);

async function getTiff() {
  var tiff =
    "https://dap.ceda.ac.uk/neodc/sentinel_ard/data/sentinel_2/2023/11/01/S2B_20231101_latn608lonw0020_T30VWN_ORB123_20231101123121_utm30n_osgb_sat.tif";
  console.log("Getting tiff data...");
  let response = await fetch(tiff);
  // let resp_buffer = await response.arrayBuffer();
  // let georaster = await parse_georaster(resp_buffer);
  // console.log("georaster:", georaster);
  // let layer = new GeoRasterLayer({
  //   georaster: georaster,
  //   opacity: 0.7,
  //   pixelValuesToColorFn: (values) =>
  //     values[0] === 42 ? "#ffffff" : "#000000",
  //   resolution: 64, // optional param                                                                                                                                                                                                                                                                                                eter for adjusting display resolution
  // });
  // layerControl.addOverlay(layer, "tiff");
  console.log("added");
  //response_buffer = response.arrayBuffer();
}
var tiff =
  "https://dap.ceda.ac.uk/neodc/sentinel_ard/data/sentinel_2/2023/11/01/S2B_20231101_latn608lonw0020_T30VWN_ORB123_20231101123121_utm30n_osgb_sat.tif";
fetch(tiff)
  .then((r) => r.arrayBuffer())
  .then((arrayBuffer) => {
    parse_georaster(arrayBuffer).then((georaster) => {
      console.log("georaster:", georaster);

      var layer = new GeoRasterLayer({
        georaster: georaster,
        opacity: 0.7,
        pixelValuesToColorFn: (values) =>
          values[0] === 42 ? "#ffffff" : "#000000",
        resolution: 64, // optional param                                                                                                                                                                                                                                                                                                eter for adjusting display resolution
      });
      layerControl.addOverlay(layer, "tiff");
      console.log("added");
    });
  })
  .catch((err) => {
    console.log(err);
  });

//let x = getTiff().response;

//console.log(x);

// layer.addTo(map);
