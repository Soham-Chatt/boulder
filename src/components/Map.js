import { useState, useEffect } from 'react';
import {
  APIProvider,
  Map as GoogleMap,
  AdvancedMarker,
  InfoWindow,
  useMap,
} from '@vis.gl/react-google-maps';

const COLORS = {
  visited: '#2f7531',
  closed:  '#666666',
  open:    '#1a73e8',
  user:    '#ea4335',
};

function markerColor(hall) {
  if (hall.closed)  return COLORS.closed;
  if (hall.visited) return COLORS.visited;
  return COLORS.open;
}

function Pin({ color }) {
  return (
    <svg width="22" height="32" viewBox="0 0 22 32" style={{ cursor: 'pointer', filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.4))' }}>
      <path d="M11 0C4.925 0 0 4.925 0 11c0 7.667 11 21 11 21s11-13.333 11-21C22 4.925 17.075 0 11 0z" fill={color} />
      <circle cx="11" cy="11" r="4.5" fill="white" fillOpacity="0.75" />
    </svg>
  );
}

function UserPin() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.4))' }}>
      <circle cx="9" cy="9" r="9" fill={COLORS.user} />
      <circle cx="9" cy="9" r="5" fill="white" />
      <circle cx="9" cy="9" r="3" fill={COLORS.user} />
    </svg>
  );
}

function PanToUser({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (map && coords?.latitude && coords?.longitude) {
      map.panTo({ lat: coords.latitude, lng: coords.longitude });
    }
  }, [map, coords]);
  return null;
}

function MapInner({ data, coords }) {
  const [selected, setSelected] = useState(null);
  const halls = data.filter((h) => h.latitude && h.longitude);

  const defaultCenter = (() => {
    if (coords?.latitude) return { lat: coords.latitude, lng: coords.longitude };
    const lats = halls.map((h) => h.latitude);
    const lngs = halls.map((h) => h.longitude);
    return {
      lat: (Math.min(...lats) + Math.max(...lats)) / 2,
      lng: (Math.min(...lngs) + Math.max(...lngs)) / 2,
    };
  })();

  return (
    <GoogleMap
      style={{ height: '50vh', width: '100%' }}
      defaultCenter={defaultCenter}
      defaultZoom={coords?.latitude ? 11 : 8}
      minZoom={3}
      gestureHandling="cooperative"
      mapId={process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID}
    >
      <PanToUser coords={coords} />

      {halls.map((hall, i) => (
        <AdvancedMarker
          key={i}
          position={{ lat: hall.latitude, lng: hall.longitude }}
          onClick={() => setSelected(hall)}
        >
          <Pin color={markerColor(hall)} />
        </AdvancedMarker>
      ))}

      {coords?.latitude && coords?.longitude && (
        <AdvancedMarker position={{ lat: coords.latitude, lng: coords.longitude }}>
          <UserPin />
        </AdvancedMarker>
      )}

      {selected && (
        <InfoWindow
          position={{ lat: selected.latitude, lng: selected.longitude }}
          onCloseClick={() => setSelected(null)}
        >
          <div style={{ color: '#222', minWidth: 140 }}>
            <strong>{selected.name}</strong><br />
            <span style={{ fontSize: '0.85em', color: '#555' }}>{selected.city}</span>
            {selected.closed && (
              <><br /><span style={{ fontSize: '0.8em', color: '#888' }}>Gesloten</span></>
            )}
            <br />
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${selected.latitude},${selected.longitude}&destination_place_id=${selected.name}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                marginTop: 6,
                fontSize: '0.82em',
                color: '#1a73e8',
                textDecoration: 'none',
                fontWeight: 500,
              }}
            >
              ↗ Route
            </a>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}

function Map({ data, coords }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return <div style={{ height: '50vh', width: '100%' }} />;

  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? ''}>
      <MapInner data={data} coords={coords} />
    </APIProvider>
  );
}

export default Map;
