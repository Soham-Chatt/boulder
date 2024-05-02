import React, {useEffect} from 'react';
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

const UpdateCenter = ({ coords }) => {
  const map = useMap();

  useEffect(() => {
    if (coords && coords.latitude && coords.longitude) {
      map.panTo(new L.LatLng(coords.latitude, coords.longitude), map.getZoom(), { animate: true, duration: 0.5 });
    }
  }, [coords, map]);

  return null;
};


function Map ({ data, coords }) {
  const validData = data.filter(marker => marker.latitude && marker.longitude);
  const center = validData.reduce((acc, marker) => {
    acc.lat += marker.latitude;
    acc.lon += marker.longitude;
    return acc;
  }, {lat: 0, lon: 0, count: validData.length});

  const defaultPosition = [center.lat / center.count, center.lon / center.count];

  const icons = {
    blueIcon: new L.Icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    }),
    greenIcon: new L.Icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    }),
    redIcon: new L.Icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    })
  };
  console.log(coords)
  return (
    <MapContainer
      style={{ height: "50vh", width: "100%" }}
      center={coords && coords.lat && coords.lon ? [coords.lat, coords.lon] : defaultPosition}
      zoom={10}
      minZoom={3}
      scrollWheelZoom={true}
    >
      <ComponentResize />
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <UpdateCenter coords={coords} />
      {validData.map((marker, index) => (
        <Marker
          key={index}
          position={[marker.latitude, marker.longitude]}
          icon={marker.visited ? icons.greenIcon : icons.blueIcon}>
          <Popup>{marker.name}<br />{marker.description}</Popup>
        </Marker>
      ))}
      {coords && coords.latitude && coords.longitude && (
        <Marker
          key="current"
          position={[coords.latitude, coords.longitude]}
          icon={icons.redIcon}>
          <Popup>Huidige locatie</Popup>
        </Marker>
      )}
    </MapContainer>
  );
}

export default Map;
