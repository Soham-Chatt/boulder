import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from 'leaflet';
import "leaflet/dist/leaflet.css";

const ComponentResize = () => {
  const map = useMap();
  setTimeout(() => {
    map.invalidateSize();
  }, 0);
  return null;
};

const Map = ({ data, coords }) => {
  // Calculate the center based on all data markers that have valid coordinates
  const validData = data.filter(marker => marker.latitude && marker.longitude);
  const center = validData.reduce((acc, marker) => {
    acc.lat += marker.latitude;
    acc.lon += marker.longitude;
    return acc;
  }, {lat: 0, lon: 0, count: validData.length});

  const defaultPosition = center.count > 0 ? [center.lat / center.count, center.lon / center.count] : [0, 0];

  const blueIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  // Green icon for visited
  const greenIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  // Red icon for current location
  const redIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  return (
    <MapContainer
      style={{ height: "500px", width: "100%" }}
      center={coords && coords.lat && coords.lon ? [coords.lat, coords.lon] : defaultPosition}
      zoom={8}
      minZoom={3}
      scrollWheelZoom={true}
    >
      <ComponentResize />
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {validData.map((marker, index) => (
        <Marker key={index}
                position={[marker.latitude, marker.longitude]}
                icon={marker.visited ? greenIcon : blueIcon }>
          <Popup>{marker.name}<br />{marker.description}</Popup>
        </Marker>
      ))}
      {coords && coords.lat && coords.lon && (
        <Marker
          key="current"
          position={[coords.lat, coords.lon]}
          icon={redIcon}>
          <Popup>U bent hier</Popup>
        </Marker>
      )}
    </MapContainer>
  );
};

export default Map;
