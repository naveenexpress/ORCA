import React, { useState, useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  Circle,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import {
  Anchor,
  Fish,
  Compass,
  Navigation,
  Layers,
  MapPin,
  ShieldCheck,
  Radio,
  Eye,
} from 'lucide-react';
import { Coordinates } from '../../types';
import { MaritimeRouteResult, generateMaritimeSeaRoute } from '../../services/voyageService';
import { useMapStore } from '../../store/mapStore';

interface VoyageMapProps {
  departure: { name: string; coordinates: Coordinates };
  destination: { name: string; coordinates: Coordinates };
  bearingDegrees: number;
  compassDirection: string;
  distanceNm: number;
  distanceKm: number;
  seaRoute?: MaritimeRouteResult;
  onDestinationSelect?: (coords: Coordinates) => void;
  height?: string;
}

// Leaflet custom marker icons
const createIcon = (svgHtml: string, size = 32) => {
  return L.divIcon({
    html: svgHtml,
    className: 'custom-leaflet-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
};

const departureIcon = createIcon(
  `<div class="relative flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 border-2 border-white text-white shadow-lg">
    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="5" r="3"/><line x1="12" y1="22" x2="12" y2="8"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/></svg>
  </div>`,
  32
);

const destinationIcon = createIcon(
  `<div class="relative flex items-center justify-center w-9 h-9 rounded-full bg-emerald-500 border-2 border-white text-white shadow-xl animate-pulse">
    <div class="absolute inset-0 rounded-full border-2 border-emerald-300 animate-ping opacity-75"></div>
    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6-.94 3.46-3.44 6-7 6s-7.56-2.54-8.5-6Z"/><path d="M18 12v.5"/></svg>
  </div>`,
  36
);

const waypointIcon = createIcon(
  `<div class="flex items-center justify-center w-4 h-4 rounded-full bg-amber-500 border-2 border-white text-black shadow-md">
    <div class="w-1.5 h-1.5 rounded-full bg-black"></div>
  </div>`,
  16
);

// Map bounds auto-fitter for all points on route
const MapRouteBoundsFitter: React.FC<{ points: Coordinates[] }> = ({ points }) => {
  const map = useMap();
  useEffect(() => {
    if (!points || points.length === 0) return;
    const latLngs = points.map((p) => L.latLng(p.lat, p.lng));
    const bounds = L.latLngBounds(latLngs);
    map.fitBounds(bounds, { padding: [55, 55], maxZoom: 10 });
  }, [points, map]);
  return null;
};

// Map click listener for setting custom destination
const MapClickListener: React.FC<{ onClick: (coords: Coordinates) => void }> = ({ onClick }) => {
  useMapEvents({
    click(e) {
      onClick({ lat: +e.latlng.lat.toFixed(4), lng: +e.latlng.lng.toFixed(4) });
    },
  });
  return null;
};

export const VoyageMap: React.FC<VoyageMapProps> = ({
  departure,
  destination,
  bearingDegrees,
  compassDirection,
  distanceNm,
  distanceKm,
  seaRoute: providedSeaRoute,
  onDestinationSelect,
  height = '460px',
}) => {
  const { cartoApiKey } = useMapStore();

  // Map theme: 'nautical' (Esri Ocean) | 'satellite' (Esri Satellite) | 'dark' (CARTO Dark)
  const [mapTheme, setMapTheme] = useState<'nautical' | 'satellite' | 'dark'>('nautical');
  const [showSeamarks, setShowSeamarks] = useState(true);
  const [showRangeRings, setShowRangeRings] = useState(true);

  // Compute maritime route if not provided
  const seaRoute =
    providedSeaRoute || generateMaritimeSeaRoute(departure.coordinates, destination.coordinates);

  const routePositions: [number, number][] = seaRoute.waypoints.map((p) => [p.lat, p.lng]);

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden border border-[#563943] shadow-xl bg-marine-950 select-none"
      style={{ height }}
    >
      {/* Top Floating Telemetry & Map Controls Header */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-col md:flex-row md:items-start justify-between gap-2 pointer-events-none">
        {/* Left: Course Telemetry & Passage Banner */}
        <div className="flex flex-col gap-1.5 pointer-events-auto max-w-full md:max-w-[60%]">
          <div className="bg-[#140C14]/92 backdrop-blur-md border border-[#563943] rounded-xl px-3 py-2 text-xs flex flex-wrap items-center gap-2.5 shadow-lg">
            <div className="flex items-center gap-1.5 text-cyan-300 font-mono font-bold">
              <Compass className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>Course: {seaRoute.bearingDegrees}° ({seaRoute.compassDirection})</span>
            </div>

            <span className="text-[#452D36] hidden sm:inline">|</span>

            <div className="flex items-center gap-1.5 text-[#10B981] font-mono font-bold">
              <Navigation className="w-3.5 h-3.5" />
              <span>Sea Distance: {seaRoute.totalDistanceNm} NM ({seaRoute.totalDistanceKm} km)</span>
            </div>

            {seaRoute.isCrossPeninsular && (
              <span className="px-2 py-0.5 bg-[#C05615]/30 text-[#F59E0B] border border-[#C05615]/50 rounded-md font-mono text-[10px] font-extrabold flex items-center gap-1 animate-pulse">
                <ShieldCheck className="w-3 h-3" />
                Cape Comorin South Sea Corridor
              </span>
            )}
          </div>

          {/* Passage Info Note */}
          <div className="bg-[#140C14]/85 backdrop-blur-xs border border-[#452D36] rounded-lg px-2.5 py-1 text-[11px] text-[#D4C2B6] flex items-center gap-1.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#10B981] shrink-0" />
            <span className="font-semibold text-white shrink-0">{seaRoute.routeTitle}:</span>
            <span className="truncate">{seaRoute.passagesDescription}</span>
          </div>
        </div>

        {/* Right: Map Style Switcher & Seamark Toggle */}
        <div className="flex flex-col items-start md:items-end gap-1.5 pointer-events-auto shrink-0">
          <div className="bg-[#140C14]/90 backdrop-blur-md border border-[#563943] rounded-xl p-1 text-[11px] flex items-center gap-1 shadow-lg">
            <button
              type="button"
              onClick={() => setMapTheme('nautical')}
              className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
                mapTheme === 'nautical'
                  ? 'bg-[#0284C7] text-white shadow-xs'
                  : 'text-[#D4C2B6] hover:text-white hover:bg-white/10'
              }`}
            >
              <span>🌊 Nautical Chart</span>
            </button>

            <button
              type="button"
              onClick={() => setMapTheme('satellite')}
              className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
                mapTheme === 'satellite'
                  ? 'bg-[#10B981] text-white shadow-xs'
                  : 'text-[#D4C2B6] hover:text-white hover:bg-white/10'
              }`}
            >
              <span>🛰️ Satellite</span>
            </button>

            <button
              type="button"
              onClick={() => setMapTheme('dark')}
              className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
                mapTheme === 'dark'
                  ? 'bg-[#C05615] text-white shadow-xs'
                  : 'text-[#D4C2B6] hover:text-white hover:bg-white/10'
              }`}
            >
              <span>🌑 Dark</span>
            </button>
          </div>

          {/* Seamarks Toggle Pill */}
          <button
            type="button"
            onClick={() => setShowSeamarks(!showSeamarks)}
            className={`px-2.5 py-1 bg-[#140C14]/90 backdrop-blur-md border border-[#563943] rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-md transition ${
              showSeamarks ? 'text-[#10B981] border-[#10B981]/40' : 'text-[#7890A5]'
            }`}
          >
            <Radio className="w-3 h-3" />
            <span>OpenSeaMap Seamarks: {showSeamarks ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* Bottom Hint */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-[#140C14]/85 backdrop-blur-xs border border-[#563943] rounded-lg px-2.5 py-1 text-[11px] text-[#D4C2B6] shadow-sm">
        💡 Click on ocean to set custom fishing ground · Sea route navigates strictly around land
      </div>

      <MapContainer
        center={[departure.coordinates.lat, departure.coordinates.lng]}
        zoom={7}
        className="w-full h-full z-10"
        zoomControl={false}
      >
        <MapRouteBoundsFitter points={seaRoute.waypoints} />
        {onDestinationSelect && <MapClickListener onClick={onDestinationSelect} />}

        {/* 1. NAUTICAL SEA CHART THEME (Esri Ocean Base + Ocean Reference) */}
        {mapTheme === 'nautical' && (
          <>
            <TileLayer
              key="esri_ocean_base"
              attribution='Tiles &copy; Esri &mdash; Sources: GEBCO, NOAA, CHS, OSU, UNH, CSUMB, National Geographic'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}"
              maxZoom={16}
            />
            <TileLayer
              key="esri_ocean_ref"
              attribution='&copy; Esri World Ocean Reference'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Reference/MapServer/tile/{z}/{y}/{x}"
              maxZoom={16}
            />
          </>
        )}

        {/* 2. SATELLITE OCEAN THEME */}
        {mapTheme === 'satellite' && (
          <TileLayer
            key="esri_satellite"
            attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            maxZoom={18}
          />
        )}

        {/* 3. MARINE DARK THEME */}
        {mapTheme === 'dark' && (
          <TileLayer
            key="carto_dark"
            attribution='&copy; CARTO &copy; OpenStreetMap'
            url={
              cartoApiKey
                ? `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png?key=${encodeURIComponent(cartoApiKey)}`
                : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
            }
            maxZoom={19}
            subdomains="abcd"
          />
        )}

        {/* OpenSeaMap Marine Seamark Layer (Lighthouses, Buoys, Sea Beacons) */}
        {showSeamarks && (
          <TileLayer
            key="openseamap_seamarks"
            url="https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png"
            attribution="&copy; OpenSeaMap contributors"
            maxZoom={18}
          />
        )}

        {/* Range Rings around Departure (10 NM & 25 NM) */}
        {showRangeRings && (
          <>
            <Circle
              center={[departure.coordinates.lat, departure.coordinates.lng]}
              radius={18520} // 10 Nautical Miles
              pathOptions={{
                color: '#F59E0B',
                fillColor: '#F59E0B',
                fillOpacity: 0.03,
                weight: 1.5,
                dashArray: '4, 4',
              }}
            />
            <Circle
              center={[departure.coordinates.lat, departure.coordinates.lng]}
              radius={46300} // 25 Nautical Miles
              pathOptions={{
                color: '#10B981',
                fillColor: '#10B981',
                fillOpacity: 0.02,
                weight: 1.5,
                dashArray: '6, 6',
              }}
            />
          </>
        )}

        {/* The Authentic Maritime Sea Route Polyline */}
        <Polyline
          positions={routePositions}
          pathOptions={{
            color: seaRoute.isCrossPeninsular ? '#F59E0B' : '#0284C7',
            weight: 4,
            opacity: 0.95,
            dashArray: '10, 6',
          }}
        />

        {/* Intermediate Maritime Passage Waypoints */}
        {seaRoute.waypointMarkers
          .filter((wp) => !wp.isDeparture && !wp.isDestination)
          .map((wp, idx) => (
            <Marker key={wp.id || `wp-${idx}`} position={[wp.coords.lat, wp.coords.lng]} icon={waypointIcon}>
              <Popup>
                <div className="p-2 text-xs font-sans space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-600">
                    <Compass className="w-3.5 h-3.5" />
                    <span>Maritime Sea Waypoint #{idx + 1}</span>
                  </div>
                  <p className="font-semibold text-slate-800">{wp.name}</p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    {wp.coords.lat.toFixed(4)}°N, {wp.coords.lng.toFixed(4)}°E
                  </p>
                  <span className="inline-block px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[9px] font-mono font-bold">
                    NAVIGABLE SEA CORRIDOR
                  </span>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* Departure Port Marker */}
        <Marker
          position={[departure.coordinates.lat, departure.coordinates.lng]}
          icon={departureIcon}
        >
          <Popup>
            <div className="p-2.5 text-xs font-sans space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-blue-600">
                <Anchor className="w-3.5 h-3.5" />
                <span>Departure Port</span>
              </div>
              <p className="font-bold text-slate-900 text-sm">{departure.name}</p>
              <p className="text-[10px] text-slate-500 font-mono">
                {departure.coordinates.lat.toFixed(4)}°N, {departure.coordinates.lng.toFixed(4)}°E
              </p>
              <p className="text-[11px] text-slate-600 pt-1 border-t">
                Destination: {destination.name}
              </p>
            </div>
          </Popup>
        </Marker>

        {/* Target Destination Marker */}
        <Marker
          position={[destination.coordinates.lat, destination.coordinates.lng]}
          icon={destinationIcon}
        >
          <Popup>
            <div className="p-2.5 text-xs font-sans space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-emerald-600">
                <Fish className="w-3.5 h-3.5" />
                <span>Target Fishing Ground</span>
              </div>
              <p className="font-bold text-slate-900 text-sm">{destination.name}</p>
              <p className="text-[10px] text-slate-500 font-mono">
                {destination.coordinates.lat.toFixed(4)}°N, {destination.coordinates.lng.toFixed(4)}°E
              </p>
              <div className="p-1.5 bg-slate-100 rounded text-[11px] font-mono text-slate-700">
                Total Sea Route: <strong>{seaRoute.totalDistanceNm} NM</strong> ({seaRoute.totalDistanceKm} km)
              </div>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};
