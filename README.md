## Using Leaflet Javascript package to display Tiff data from STAC catalog API

To run this program, run `npm start` within this directory and go to the specified url (e.g. `http://127.0.0.1:9966/`).

This application makes calls to the CEDA STAC catalog API, a UI for which is provided [here](https://radiantearth.github.io/stac-browser/#/).
We also make use of the georaster-layer-for-leaflet package which is available [here](https://github.com/GeoTIFF/georaster-layer-for-leaflet).

You can then select the data you wish to load onto the map.
To reduce memory usage, each layer is loaded when selected and so will take a few seconds to be populated onto the map.

Note, some layers appear better than others, as many contain multiple bands of data which is not yet handled by this application.

## Future development
In future, it might be more efficient to conver the tiff data to a png for the selected band data before populating on the map.
We also need to handle the selection of individual bands within each tif which could be provided via a nested control panel as seen in the top right of the wedpage.

