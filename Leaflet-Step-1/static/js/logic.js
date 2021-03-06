// URL to get for geoJSON from USGS. Data set use "All Earthquakes from the Past 7 Days"
const url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Function to create map
function createMap(earthquakes){
    // Create the tile layer that will be the background of our map
    var streetmap = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',{
        attribution: 'Tiles &copy; CartoDB'});

    // Create the map.
    var map = L.map("map", {
        center: [31.51073, -96.4247],
        zoom: 5,
        layers: [streetmap, earthquakes]
    });

    // Create a baseMap object to hold the streetMap
    var baseMap = {
        "Gray map": streetmap
    };
    
    // Create an overlayMaps object to hold earthquakes 
    var overlayMaps = {
        "Earthquake": earthquakes
    };

    // Add a layer control to display baseMap and overlayMaps
    L.control.layers(baseMap, overlayMaps, {
        collapsed: false,
    }).addTo(map);

    // Get Colors for Legend
    function getColor(d) {
        return d > 90 ? '#FC2500':
        d > 70 ? "#FC7300":
        d > 50 ? "#FC5400":
        d > 30 ? '#FCCD5D':
        d > 10 ? '#9ACD32':
        '#00FF00';
    }

    // Create a legend to display information about our map.
    var info = L.control({
        position: "bottomright"
    });

    // When the layer control is added, insert a div with the class of "legend".
    info.onAdd = function(map) {
        var div = L.DomUtil.create("div", "info legend");
        categories = [-10, 10, 30, 50, 70, 90];
        labels = [];

        // Loop though categories numbers for legend color match
        for (var j=0; j < categories.length; j++) {
            // Push to labels array to add to DOM element
            div.innerHTML += `<i style="background:`+getColor(categories[j]+1)+`"></i>` + categories[j]+(categories[j+1] ? '&ndash;' +
                categories[j+1] + '<br>': '+')
        }
        return div;
    };

    // Add the info legend to the map.
    info.addTo(map);
}

// function to create Markers
function createMarkers(response){
        
        //Pull the features from response.data
        var features = response.features;

        // Initialize an array to hold earthquake markers
        var markers = [];

        // Set color on earthquake depth
        var color = '';
        
        // Loop through the features array
        for (var i = 0; i<features.length; i++){
            var feature = features[i]
            var lon = feature.geometry.coordinates[0]
            var lat = feature.geometry.coordinates[1]
            var depth = feature.geometry.coordinates[2]
            // Set color on depth
            if (depth < 10){
                color = '#00FF00'
            } else if (depth < 30) {
                color = '#9ACD32'
            } else if (depth < 50){
                color = '#FCCD5D'
            } else if (depth < 70){
                color = "#FC5400"
            } else if (depth < 90){
                color = "#FC7300"
            } else {
                color = '#FC2500'
            }

            // For each earthquake, create a marker, and bind a popup with the location, time and magnitud
            var marker = L.circle([lat, lon], {
                fillColor: color,
                weight: 0.5,
                fillOpacity: 0.9,
                //Adjust the radius
                radius: feature.properties.mag*10000
            }).bindPopup(`<h1>${feature.properties.place}</h1><hr><h4>Time: ${new Date(feature.properties.time)}</h4><p>Magnitud: ${feature.properties.mag}</p>`)

            // Add marker to the markers array
            markers.push(marker);
        }

        // Create a layer group that's made from the earthquake array, and pass it to the createMap function
        createMap(L.layerGroup(markers));

}

// Perform an API call to the USGS information endpoint.
d3.json(url).then(createMarkers); 

