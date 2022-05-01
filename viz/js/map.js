mapboxgl.accessToken =
  "pk.eyJ1Ijoic2hhbmU5OGMiLCJhIjoiY2wybnNoZThzMDZnYzNjcGtmcHZ1dDdkNSJ9.QYAXOQc6TYwM2jqzuknVdQ";
const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/dark-v10",
  center: [-93.5, 46.5],
  zoom: 7,
});

map.on("load", () => {
  map.addSource("actions", {
    type: "geojson",
    data: "./data/actions_with_agencies.json",
  });
  map.addLayer({
    id: "actions",
    type: "circle",
    source: "actions",
    layout: {},
    paint: {
      "circle-color": "#00b7bf",
      "circle-radius": 8,
      "circle-stroke-width": 1,
      "circle-stroke-color": "#333",
    },
  });

  map.addSource("agencies_pts", {
    type: "geojson",
    data: null,
  });
  map.addLayer({
    id: "agencies_pts",
    type: "circle",
    source: "agencies_pts",
    layout: {},
    paint: {
      "circle-color": "red",
      "circle-radius": 8,
      "circle-stroke-width": 1,
      "circle-stroke-color": "#333",
    },
  });

  map.addSource("agencies_line", {
    type: "geojson",
    data: null,
  });
  map.addLayer({
    id: "agencies_line",
    type: "line",
    source: "agencies_line",
    layout: {
      "line-join": "round",
      "line-cap": "round",
    },
    paint: {
      "line-color": "red",
      "line-width": 3,
    },
  });

  map.addSource("selected_action", {
    type: "geojson",
    data: null,
  });
  map.addLayer({
    id: "selected_action",
    type: "circle",
    source: "selected_action",
    layout: {},
    paint: {
      "circle-color": "#00b7bf",
      "circle-radius": 18,
      "circle-stroke-width": 1,
      "circle-stroke-color": "#333",
    },
  });

  map.on("click", "actions", (e) => {
    action = e.features[0];
    agencies_pts = JSON.parse(action.properties.agency_geojson);
    const action_coords = action.geometry.coordinates.slice();
    map.getSource("agencies_pts").setData(agencies_pts);
    console.log(action_coords);
    console.log(agencies_pts);
    console.log(action.properties);
    const lineFeatures = {
      type: "FeatureCollection",
      features: [],
    };
    agencies_pts.features.map((agency) => {
      if (agency.geometry) {
        lineFeatures.features.push({
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: [action_coords, agency.geometry.coordinates.slice()],
          },
        });
      }
    });
    map.getSource("agencies_line").setData(lineFeatures);
    map.getSource("selected_action").setData({
      type: "Feature",
      properties: {},
      geometry: {
        type: "Point",
        coordinates: action_coords,
      },
    });

    const popup =
      "<b>" +
      action.properties["Date(s)"] +
      "</b><br>" +
      action.properties["Description"];
    new mapboxgl.Popup().setLngLat(action_coords).setHTML(popup).addTo(map);
  });
});