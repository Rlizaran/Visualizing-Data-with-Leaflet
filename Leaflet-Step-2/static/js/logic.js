// URL to get for geoJSON from USGS. Data set use "All Earthquakes from the Past 7 Days"
const url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
const tectonicURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

// Function to create map
function createMap(earthquakes, tectonic){
    
    var greyscaleMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?" +
    "access_token={accessToken}",{
      attribution: "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"http://mapbox.com\">Mapbox</a>",
      maxZoom: 18,
      accessToken: API_KEY});
  
  // satellite background.
  var satelliteMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v9/tiles/256/{z}/{x}/{y}?" +
    "access_token={accessToken}",{
      attribution: "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"http://mapbox.com\">Mapbox</a>",
      maxZoom: 18,
      accessToken: API_KEY});
  
  // outdoors background.
  var outdoorsMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v9/tiles/256/{z}/{x}/{y}?" +
    "access_token={accessToken}",{
      attribution: "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"http://mapbox.com\">Mapbox</a>",
      maxZoom: 18,
      accessToken: API_KEY});

    // Create the map.
    var map = L.map("map", {
        center: [0,0],
        zoom: 4,
        layers: [satelliteMap, earthquakes, tectonic]
    });


    // Create a baseMap object to hold the map view
    var baseMap = {
        "Gray map": greyscaleMap,
        "Satellite": satelliteMap,
        "Street Map": outdoorsMap
    };
    
    // Create an overlayMaps object to hold earthquakes and tectonic plates 
    var overlayMaps = {
        "Earthquake": earthquakes,
        "Tectonic Plates": tectonic
    };

    // Add a layer control to display baseMap and overlayMaps
    L.control.layers(baseMap, overlayMaps, {
        collapsed: false,
    }).addTo(map);

    

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
function createMarkers(earthquake){
        
        //Pull the features from earthquake.data
        var features = earthquake.features;
        var markers = [];
        
        // Loop through the features array
        for (var i = 0; i<features.length; i++){
            var feature = features[i]
            var lon = feature.geometry.coordinates[0]
            var lat = feature.geometry.coordinates[1]
            var depth = feature.geometry.coordinates[2]
            // Set color on depth
            

            // For each earthquake, create a marker, and bind a popup with the location, time and magnitud
            var marker = L.circle([lat, lon], {
                fillColor: getColor(depth),
                weight: 0.5,
                fillOpacity: 0.9,
                //Adjust the radius
                radius: feature.properties.mag*10000
            }).bindPopup(`<h1>${feature.properties.place}</h1><hr><h4>Time: ${new Date(feature.properties.time)}</h4>
            <p>Magnitud: ${feature.properties.mag}</p><br><p>Depth: ${feature.geometry.coordinates[2]}`)

            // Add marker to the markers array
            markers.push(marker);
            
        }

        tectonic = new L.layerGroup()

        d3.json(tectonicURL).then(tectonicplate =>{
            L.geoJson(tectonicplate, {
                color: "orange",
                weight: 2
            }).addTo(tectonic)})

        // Create a layer group that's made from the earthquake array, and pass it to the createMap function
        createMap(L.layerGroup(markers), tectonic);
}

// Get Colors for Legend
function getColor(d) {
    return d > 90 ? '#FC2500':
    d > 70 ? "#FC5400":
    d > 50 ? "#FC7300":
    d > 30 ? '#FCCD5D':
    d > 10 ? '#9ACD32':
    '#00FF00';
}
// Perform an API call to the USGS information endpoint.
d3.json(url).then(data => {
    createMarkers(data)
});

