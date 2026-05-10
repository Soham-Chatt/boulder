import { useState, useEffect } from 'react';
import {
  APIProvider,
  Map as GoogleMap,
  AdvancedMarker,
  InfoWindow,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';

const COLORS = {
  visited: '#2f7531',
  closed:  '#666666',
  open:    '#1a73e8',
  user:    '#ea4335',
};

// Module-level cache — survives Map remounts when the toggle is pressed
const photoCache = {};

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

function MapColorScheme({ isDark }) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    map.setOptions({ colorScheme: isDark ? 'DARK' : 'LIGHT' });
  }, [map, isDark]);
  return null;
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

// Fetches a Google Places photo for the hall, with module-level caching.
// Requires "Places API (New)" enabled on the Maps JS API key in Google Cloud Console.
function PlacePhoto({ hall }) {
  const placesLib = useMapsLibrary('places');
  const [photoUrl, setPhotoUrl] = useState(() =>
    hall.name in photoCache ? photoCache[hall.name] : undefined
  );

  useEffect(() => {
    if (hall.name in photoCache) {
      setPhotoUrl(photoCache[hall.name]);
      return;
    }
    if (!placesLib?.Place) return;

    placesLib.Place.searchByText({
      textQuery: `${hall.name} ${hall.city}`,
      fields: ['photos'],
      maxResultCount: 1,
      region: 'nl',
    }).then(({ places }) => {
      const url = places?.[0]?.photos?.[0]?.getURI({ maxWidth: 300 }) ?? null;
      photoCache[hall.name] = url;
      setPhotoUrl(url);
    }).catch(() => {
      photoCache[hall.name] = null;
      setPhotoUrl(null);
    });
  }, [placesLib, hall.name, hall.city]);

  if (photoUrl === undefined) {
    return (
      <div style={{
        height: 110,
        background: 'var(--bs-secondary-bg, #e9ecef)',
        borderRadius: 6,
        marginTop: 8,
        animation: 'pulse 1.5s ease-in-out infinite',
      }} />
    );
  }
  if (!photoUrl) return null;

  return (
    <img
      src={photoUrl}
      alt={hall.name}
      style={{
        width: '100%',
        maxHeight: 150,
        objectFit: 'cover',
        borderRadius: 6,
        marginTop: 8,
        display: 'block',
      }}
    />
  );
}

function MapInner({ data, coords, isDark }) {
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
      colorScheme={isDark ? 'DARK' : 'LIGHT'}
    >
      <MapColorScheme isDark={isDark} />
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
          minWidth={220}
        >
          <div style={{ color: '#222', width: 210 }}>
            <PlacePhoto key={selected.name} hall={selected} />
            <div style={{ marginTop: photoCache[selected.name] === null ? 0 : 8 }}>
              <strong style={{ fontSize: '0.95em' }}>{selected.name}</strong><br />
              <span style={{ fontSize: '0.82em', color: '#555' }}>{selected.city}</span>
              {selected.closed && (
                <><br /><span style={{ fontSize: '0.78em', color: '#888' }}>Gesloten</span></>
              )}
            </div>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${selected.name}, ${selected.city}, Nederland`)}&travelmode=transit`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                marginTop: 8,
                fontSize: '0.82em',
                color: '#1a73e8',
                textDecoration: 'none',
                fontWeight: 600,
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

function Map({ data, coords, isDark }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return <div style={{ height: '50vh', width: '100%' }} />;

  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? ''}>
      <MapInner data={data} coords={coords} isDark={isDark} />
    </APIProvider>
  );
}

export default Map;
