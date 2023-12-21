var GeoRasterLayer = require("georaster-layer-for-leaflet");
var parse_georaster = require("georaster");
var L = require("leaflet");

// currently only supports a single band at a time
// only works with dates of format: ["YYYY-MM-DD","YYYY-MM-DD"] and for greater/less than or equal too inclusive times
// currently only returns first 10 entries
function get_search_url(collection, temporal_extent, bbox) {
  var bbox = `bbox=${bbox[0]}%2C${bbox[1]}%2C${bbox[2]}%2C${bbox[3]}`;
  var collection = `collections=${collection}`;
  var temporal_extent = `%7B%22start_datetime%22%3A%7B%22gte%22%3A%22${temporal_extent[0]}%22%7D%2C%22end_datetime%22%3A%7B%22lte%22%3A%22${temporal_extent[1]}%22%7D%7D`;

  url = `https://api.stac.ceda.ac.uk/search?${bbox}&${collection}&query=${temporal_extent}`;

  return url;
}

async function generateTiff(tiff, band = null, layerControl, name) {
  try {
    const response = await fetch(tiff);
    const arrayBuffer = await response.arrayBuffer();
    const georaster = await parse_georaster(arrayBuffer);
    var layer = await new GeoRasterLayer({
      georaster: georaster,
      opacity: 1,
      //pixelValuesToColorFn: (values) =>
      //  `rgb(${values[0]},${values[1]},${values[2]})`,
      resolution: 256, // optional param                                                                                                                                                                                                                                                                                       eter for adjusting display resolution
    });
    console.log("layer is ", layer);
    layerControl.addOverlay(layer, `${name}`);
    console.log(layer._leaflet_id);
  } catch (err) {
    console.log(err);
  }
}

async function load_tif_data(url, map, count) {
  console.log(url);
  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const georaster = await parse_georaster(arrayBuffer);
    console.log(georaster);
    var temp_layer = await new GeoRasterLayer({
      georaster: georaster,
      opacity: 0.7,
      //pixelValuesToColorFn: (values) => `${values[0]}`,
      //`rgb(${values[0]},${values[0]},${values[0]})`,
      resolution: 256, // optional param                                                                                                                                                                                                                                                                                       eter for adjusting display resolution
    });
    //console.log();
    temp_layer.addTo(map);
    layer_data[count]["temp_id"] = await temp_layer._leaflet_id;
    layer_data[count]["layer"] = temp_layer;
    // console.log("loaded with id", temp_layer._leaflet_id);
    console.log(layer_data[count]["temp_id"]);
  } catch (err) {
    console.log("Something went wrong", err);
  }
}

function load_tiff() {
  try {
    var reader = new FileReader();
    reader.readAsArrayBuffer(
      "/home/tjellicoe/Downloads/S2B_20231101_latn554lonw0081_T29UNB_ORB123_20231101123121_utm29n_TM65_clouds_prob.tif"
    );
    reader.onloadend = function () {
      var arrayBuffer = reader.result;
      parseGeoraster(arrayBuffer).then((georaster) => {
        console.log("georaster:", georaster);

        var layer = new GeoRasterLayer({
          georaster: georaster,
          opacity: 0.7,
          resolution: 256,
        });
        console.log("layer:", layer);
        layer.addTo(map);

        map.fitBounds(layer.getBounds());
        document.getElementById("overlay").style.display = "none";
      });
    };
  } catch {
    console.log("error reading file");
  }
}

async function get_tif_url(url, layerControl) {
  response = await fetch(url);
  //console.log(await response.text());
  as_json = JSON.parse(await response.text());

  features = as_json["features"];
  //console.log(features);
  //instance_id = as_json["features"][0]["properties"]["instance_id"];

  for (feature of features) {
    //console.log(feature);
    assets = feature["assets"];
    //console.log(assets);
    for (asset in assets) {
      console.log(asset);
      temp_url = assets[asset]["href"];
      //console.log(temp_url);
      //console.log(asset_items[key]["href"]);
      var temp_url_array = temp_url.split(".");
      var extension = temp_url_array[temp_url_array.length - 1];
      //console.log(extension);
      if (extension === "tif") {
        //console.log(temp_url);
        layer_name = temp_url.slice(temp_url.length - 10, temp_url.length - 4);
        console.log("working on", layer_name);
        //layer_name = url.
        await generateTiff(temp_url, 0, layerControl, `${layer_name}`);
      }
    }
    //asset_urls.push(temp_url);
  }
  // load and display tif located at each url
  // count = 0;
  // for (const url of asset_urls) {
  //   var temp_url_array = url.split(".");
  //   var extension = temp_url_array[temp_url_array.length - 1];
  //   console.log(extension);
  //   if (extension === "tif") {
  //     console.log(url);
  //     //layer_name = url.
  //     generateTiff(url, 0, layerControl, `${instance_id}`);
  //   }
  //   count++;
  // }
}

// global mapping objects
var layer_data = {};
var layer_id_map = {};

// add layer to control pain but save url to a dictionary instead of loading data now
async function lazy_load_tif(url, layerControl) {
  response = await fetch(url);
  //console.log(await response.text());
  as_json = JSON.parse(await response.text());

  features = as_json["features"];
  //console.log(features);
  //instance_id = as_json["features"][0]["properties"]["instance_id"];
  var count = 0;
  for (feature of features) {
    //console.log(feature);
    assets = feature["assets"];
    //console.log(assets);
    for (asset in assets) {
      //console.log(asset);
      temp_url = assets[asset]["href"];
      //console.log(temp_url);
      //console.log(asset_items[key]["href"]);
      var temp_url_array = temp_url.split(".");
      var extension = temp_url_array[temp_url_array.length - 1];
      //console.log(extension);
      if (extension === "tif") {
        //console.log(temp_url);
        var layer = L.tileLayer("");
        layer_name = temp_url.slice(temp_url.length - 10, temp_url.length - 4);
        console.log("working on", layer_name);
        //layer_name = url.

        layerControl.addOverlay(layer, `${layer_name}`);

        layer_id_map[layer._leaflet_id] = count;
        layer_data[count] = {};
        layer_data[count]["url"] = temp_url;
        console.log(layer._leaflet_id);
        count++;
        //await generateTiff(temp_url, 0, layerControl, `${layer_id}`);
      }
    }
    //asset_urls.push(temp_url);
  }
}

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
  center: L.latLng(60.9, -2.0),
  zoom: 2,
  layers: [streets, marker],
  scrollWheelZoom: true,
});

//load_tiff();

var baseMaps = {
  OpenStreetMap: streets,
  Satellite: satellite,
};

var overlayMaps = {
  marker: marker,
  //image: imageOverlay,
  //sentinel: layer,
};

var layerControl = L.control
  .layers(baseMaps, overlayMaps, { collapsed: false })
  .addTo(map);

// generateTiff(
//   //"https://geotiff.github.io/georaster-layer-for-leaflet-example/example_4326.tif",
//   "https://dap.ceda.ac.uk/neodc/sentinel_ard/data/sentinel_2/2023/11/01/S2B_20231101_latn608lonw0020_T30VWN_ORB123_20231101123121_utm30n_osgb_clouds_prob.tif",
//   0,
//   layerControl,
//   "clouds_prob"
// );

search_url = get_search_url(
  "sentinel2_ard",
  ["1900-01-01", "2023-11-28"],
  //[-3.003, 60.369, -0.945, 61.31]
  [-6.07, 50.28, -1.46, 59.94]
);

//console.log(search_url);

// array of tif files to load and display, currently we will just display them all, however this is not very efficient
//const stac_url = get_tif_url(search_url, layerControl);
const stac_url = lazy_load_tif(search_url, layerControl);
//["https://dap.ceda.ac.uk/neodc/sentinel_ard/data/sentinel_2/2023/11/01/S2B_20231101_latn608lonw0020_T30VWN_ORB123_20231101123121_utm30n_osgb_vmsk_sharp_rad_srefdem_stdsref.tif"];

// load and display tif located at each url
// count = 0;
// for (const url of stac_url) {
//   if (url.split(".")[1] == "tif") {
//     console.log(url);
//     var layer = generateTiff(url, 0, layerControl, `${count}`);
//   }
//   count++;
//   console.log(url);
// }

//layerControl.addOverlay(layer, "tiff");

console.log("Layer added");

map.on("overlayremove", function (e) {
  currentLayerID = e.layer._leaflet_id;
  // identify local count
  layer_count = layer_id_map[currentLayerID];
  // identify URL
  temp_layer_id = layer_data[layer_count]["temp_id"];
  console.log("removing layer", temp_layer_id);
  layer = temp_layer_id = layer_data[layer_count]["layer"];
  map.removeLayer(layer);
  console.log(currentLayerID);
});
map.on("overlayadd", function (e) {
  currentLayerID = e.layer._leaflet_id;
  // identify local count
  layer_count = layer_id_map[currentLayerID];
  // identify URL
  layer_url = layer_data[layer_count]["url"];
  console.log("loading layer");
  load_tif_data(layer_url, map, layer_count);
});
