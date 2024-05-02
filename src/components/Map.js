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
  // Set default map center using coords if provided, or a fallback
  const defaultPosition = coords && coords.lat && coords.lon ? [coords.lat, coords.lon] : [36.0339, 1.6596];

  // Calculate center based on markers or use default
  const calculateCenter = () => {
    if (data.length === 0) return defaultPosition;
    const latitudes = data.map(marker => marker.latitude);
    const longitudes = data.map(marker => marker.longitude);
    const avgLatitude = latitudes.reduce((sum, lat) => sum + lat, 0) / latitudes.length;
    const avgLongitude = longitudes.reduce((sum, lon) => sum + lon, 0) / longitudes.length;
    return [avgLatitude, avgLongitude];
  };

  // Fix missing marker icons
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
  });

  return (
    <MapContainer
      style={{ height: "500px", width: "100%" }}
      center={calculateCenter()}
      zoom={8}
      minZoom={3}
      scrollWheelZoom={true}
    >
      <ComponentResize />
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {data.map((marker, index) => (
        <Marker key={index} position={[marker.latitude, marker.longitude]}>
          <Popup>{marker.name}<br />{marker.description}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default Map;
