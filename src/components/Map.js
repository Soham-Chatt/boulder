import {useEffect, useState} from 'react';
import {MapContainer, Marker, Popup, TileLayer, useMap} from "react-leaflet";
import L from 'leaflet';
import "leaflet/dist/leaflet.css";

const ComponentResize = () => {
  const map = useMap();
  setTimeout(() => {
    map.invalidateSize();
  }, 0);
  return null;
};

const UpdateCenter = ({coords}) => {
  const map = useMap();

  useEffect(() => {
    if (coords && coords.latitude && coords.longitude) {
      map.panTo(new L.LatLng(coords.latitude, coords.longitude), map.getZoom(), {animate: true, duration: 0.5});
    }
  }, [coords, map]);

  return null;
};

function Map({data, coords}) {
  const calculateCenter = (data) => {
    const latitudes = data.map(marker => marker.latitude);
    const longitudes = data.map(marker => marker.longitude);
    const center = {
      latitude: (Math.min(...latitudes) + Math.max(...latitudes)) / 2,
      longitude: (Math.min(...longitudes) + Math.max(...longitudes)) / 2
    };
    return [center.latitude, center.longitude];
  };

  const [visibleHalls, setVisibleHalls] = useState(data.filter(marker => marker.latitude && marker.longitude));

  useEffect(() => {
    setVisibleHalls(data.filter(marker => marker.latitude && marker.longitude));
  }, [data]);

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

  return (
    <MapContainer
      style={{height: "50vh", width: "100%"}}
      center={coords && coords.latitude && coords.longitude ? [coords.latitude, coords.longitude] : calculateCenter(data)}
      zoom={coords && coords.latitude && coords.longitude ? 11 : 8}
      minZoom={3}
      scrollWheelZoom={true}
    >
      <ComponentResize/>
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <UpdateCenter coords={coords}/>
      {visibleHalls.map((marker, index) => (
        <Marker
          key={index}
          position={[marker.latitude, marker.longitude]}
          icon={marker.visited ? icons.greenIcon : icons.blueIcon}>
          <Popup>{marker.name}<br/>{marker.description}</Popup>
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
