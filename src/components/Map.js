import {useEffect, useState, useMemo, useRef} from 'react';
import {MapContainer, Marker, Popup, TileLayer, useMap} from "react-leaflet";
import L from 'leaflet';

// Create icons outside component to avoid recreation
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

const ComponentResize = () => {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 0);
  }, [map]);
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
  const [mounted, setMounted] = useState(false);
  const mapRef = useRef(null);

  useEffect(() => {
    // Set mounted to true immediately on client side
    setMounted(true);
  }, []);

  useEffect(() => {
    return () => {
      if (mapRef.current) {
        const container = mapRef.current.getContainer?.() || mapRef.current._container;
        mapRef.current.remove();
        // Defensive cleanup for StrictMode double-invoke in dev.
        if (container && container._leaflet_id) {
          container._leaflet_id = null;
        }
        mapRef.current = null;
      }
    };
  }, []);

  const calculateCenter = (data) => {
    const latitudes = data.map(marker => marker.latitude);
    const longitudes = data.map(marker => marker.longitude);
    const center = {
      latitude: (Math.min(...latitudes) + Math.max(...latitudes)) / 2,
      longitude: (Math.min(...longitudes) + Math.max(...longitudes)) / 2
    };
    return [center.latitude, center.longitude];
  };

  const visibleHalls = useMemo(() =>
    data.filter(marker => marker.latitude && marker.longitude),
    [data]
  );

  // Don't render until mounted (client-side only)
  if (!mounted) {
    return <div style={{height: "50vh", width: "100%"}} />;
  }

  return (
    <MapContainer
      style={{height: "50vh", width: "100%"}}
      center={coords && coords.latitude && coords.longitude ? [coords.latitude, coords.longitude] : calculateCenter(data)}
      zoom={coords && coords.latitude && coords.longitude ? 11 : 8}
      minZoom={3}
      scrollWheelZoom={true}
      whenCreated={(map) => {
        mapRef.current = map;
      }}
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
