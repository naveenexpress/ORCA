import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polygon,
  Polyline,
  WMSTileLayer,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import {
  Layers,
  Fish,
  AlertOctagon,
  Anchor,
  User,
  Shield,
  Ruler,
  MessageSquare,
  Key,
  AlertTriangle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePfzStore } from '../../store/pfzStore';
import { useAgentStore } from '../../store/agentStore';
import { useSosStore } from '../../store/sosStore';
import { useMapStore } from '../../store/mapStore';
import { useChatStore } from '../../store/chatStore';
import { CartoApiKeyModal } from './CartoApiKeyModal';
import { SEED_LANDING_CENTRES } from '../../data/seedData';
import { PfzAdvisory, Coordinates } from '../../types';

// Custom SVG Leaflet Markers
const createIcon = (svgString: string, size = 32) => {
  return L.divIcon({
    html: svgString,
    className: 'custom-leaflet-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
};

const pfzIconHigh = createIcon(
  `<div class="relative flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-300 shadow-glow-teal animate-pulse">
    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6-.94 3.46-3.44 6-7 6s-7.56-2.54-8.5-6Z"/><path d="M18 12v.5"/></svg>
  </div>`
);

const pfzIconModerate = createIcon(
  `<div class="relative flex items-center justify-center w-8 h-8 rounded-full bg-cyan-500/20 border-2 border-cyan-400 text-cyan-300 shadow-glow-cyan">
    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6-.94 3.46-3.44 6-7 6s-7.56-2.54-8.5-6Z"/></svg>
  </div>`
);

const sosIcon = createIcon(
  `<div class="relative flex items-center justify-center w-10 h-10 rounded-full bg-red-600/30 border-2 border-red-500 text-white shadow-glow-sos">
    <div class="absolute inset-0 rounded-full border-2 border-red-400 animate-ping opacity-75"></div>
    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-red-400 fill-red-500" viewBox="0 0 24 24"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/></svg>
  </div>`,
  40
);

const harbourIcon = createIcon(
  `<div class="flex items-center justify-center w-7 h-7 rounded-full bg-blue-600 border border-white text-white shadow-md">
    <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="5" r="3"/><line x1="12" y1="22" x2="12" y2="8"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/></svg>
  </div>`,
  28
);

const agentIcon = createIcon(
  `<div class="flex items-center justify-center w-7 h-7 rounded-full bg-cyan-600 border-2 border-cyan-200 text-white shadow-lg">
    <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  </div>`,
  28
);

// Child component to hook map events
const MapEventsHandler: React.FC<{
  onCursorMove: (coords: Coordinates) => void;
  onClickMap: (coords: Coordinates) => void;
}> = ({ onCursorMove, onClickMap }) => {
  useMapEvents({
    mousemove(e) {
      onCursorMove({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
    click(e) {
      onClickMap({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
};

// Map controller component for smooth flyTo
const MapController: React.FC<{ targetCoords?: Coordinates; zoom?: number }> = ({ targetCoords, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (targetCoords) {
      map.flyTo([targetCoords.lat, targetCoords.lng], zoom || 8, { duration: 1.2 });
    }
  }, [targetCoords, zoom, map]);
  return null;
};

interface MarineMapProps {
  height?: string;
  focusAdvisoryId?: string;
  onSelectPfz?: (pfz: PfzAdvisory) => void;
}

export const MarineMap: React.FC<MarineMapProps> = ({
  height = 'calc(100vh - 4rem)',
  focusAdvisoryId,
  onSelectPfz,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { advisories, showExpired } = usePfzStore();
  const { agents, zones } = useAgentStore();
  const { incidents } = useSosStore();
  const { layers, toggleLayer, activeTileProvider, setTileProvider, cartoApiKey } = useMapStore();
  const { sendMessage, openChat } = useChatStore();


  const nasaFirmsApiKey = import.meta.env.VITE_NASA_FIRMS_MAP_KEY;
  const mapboxApiKey = import.meta.env.VITE_MAPBOX_TOKEN;

  const [cursorCoords, setCursorCoords] = useState<Coordinates>({ lat: 13.342, lng: 80.612 });
  const [isLayerControlOpen, setIsLayerControlOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [measureMode, setMeasureMode] = useState(false);
  const [measurePoints, setMeasurePoints] = useState<Coordinates[]>([]);

  const displayedAdvisories = advisories.filter((a) => (showExpired ? true : a.status === 'published'));

  const activeFocusAdvisory = focusAdvisoryId
    ? advisories.find((a) => a.id === focusAdvisoryId)
    : null;

  const handleMapClick = (coords: Coordinates) => {
    if (measureMode) {
      setMeasurePoints((prev) => [...prev, coords]);
    }
  };

  const handleAskAssistant = (advisory: PfzAdvisory) => {
    openChat();
    sendMessage(`Explain the current fishing advisory and safe depth for ${advisory.name}`);
  };

  return (
    <div className="relative w-full overflow-hidden bg-marine-950" style={{ height }}>
      {/* Leaflet Map Container */}
      <MapContainer
        center={[13.3, 80.5]}
        zoom={7}
        className="w-full h-full z-10"
        zoomControl={false}
      >
        <MapEventsHandler
          onCursorMove={setCursorCoords}
          onClickMap={handleMapClick}
        />

        {activeFocusAdvisory && (
          <MapController
            targetCoords={{ lat: activeFocusAdvisory.latitude, lng: activeFocusAdvisory.longitude }}
            zoom={9}
          />
        )}

        {/* Tile Layers */}
        {activeTileProvider === 'carto_dark' && (
          <TileLayer
            key={`carto-${cartoApiKey}`}
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url={
              cartoApiKey
                ? `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png?key=${encodeURIComponent(cartoApiKey)}`
                : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
            }
            maxZoom={19}
            subdomains="abcd"
          />
        )}
        {activeTileProvider === 'esri_dark' && (
          <TileLayer
            key="esri_dark"
            attribution='Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
            maxZoom={16}
          />
        )}
        {activeTileProvider === 'osm_standard' && (
          <TileLayer
            key="osm_standard"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />
        )}
        {activeTileProvider === 'esri_satellite' && (
          <TileLayer
            key="esri_satellite"
            attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            maxZoom={18}
          />
        )}
        {activeTileProvider === 'mapbox_dark' && mapboxApiKey && (
          <TileLayer
            key="mapbox_dark"
            attribution='&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a>'
            url={`https://api.mapbox.com/styles/v1/mapbox/dark-v11/tiles/256/{z}/{x}/{y}@2x?access_token=${mapboxApiKey}`}
            maxZoom={19}
          />
        )}
        {activeTileProvider === 'mapbox_satellite' && mapboxApiKey && (
          <TileLayer
            key="mapbox_satellite"
            attribution='&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a>'
            url={`https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}@2x?access_token=${mapboxApiKey}`}
            maxZoom={19}
          />
        )}

        {/* Live Weather Overlay (OpenWeather) */}
        {layers.showWeather && (
          <TileLayer
          key="weather_overlay"
          url="/api/weather/tile/wind_new/{z}/{x}/{y}.png"
          opacity={0.6}
          attribution="&copy; OpenWeatherMap"
        />
        )}

        {/* NASA FIRMS Thermal Anomalies */}
        {layers.showNasaFirms && nasaFirmsApiKey && (
          <WMSTileLayer
            key="nasa_firms"
            url={`https://firms.modaps.eosdis.nasa.gov/mapserver/wms/fires/${nasaFirmsApiKey}/`}
            layers="fires_viirs_snpp"
            format="image/png"
            transparent={true}
            opacity={0.7}
            attribution="&copy; NASA FIRMS"
          />
        )}

        {/* 1. Operational Zones Polygons */}
        {layers.showZones &&
          zones.map((zone) => (
            <Polygon
              key={zone.id}
              positions={zone.polygon}
              pathOptions={{
                color: zone.priority === 'Critical' ? '#ef4444' : '#0284c7',
                fillColor: zone.priority === 'Critical' ? '#ef4444' : '#0284c7',
                fillOpacity: 0.12,
                weight: 1.5,
                dashArray: '4, 4',
              }}
            >
              <Popup>
                <div className="p-3 text-xs space-y-1.5 font-sans">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-white">{zone.name}</span>
                    <span className="px-1.5 py-0.5 bg-blue-950 text-blue-300 rounded font-mono text-[10px]">
                      {zone.zoneType}
                    </span>
                  </div>
                  <p className="text-slate-300">{zone.description}</p>
                  <div className="text-slate-400 flex justify-between pt-1 border-t border-marine-750">
                    <span>Active Cases: <strong className="text-cyan-400">{zone.currentActiveCases}</strong></span>
                    <span>Capacity: <strong className="text-white">{zone.capacity}</strong></span>
                  </div>
                </div>
              </Popup>
            </Polygon>
          ))}

        {/* 2. PFZ Polygons & Centroid Markers */}
        {layers.showPfzPolygons &&
          displayedAdvisories.map((pfz) => (
            <React.Fragment key={pfz.id}>
              {pfz.polygonCoordinates && (
                <Polygon
                  positions={pfz.polygonCoordinates}
                  pathOptions={{
                    color: pfz.confidence === 'High' ? '#10b981' : '#06b6d4',
                    fillColor: pfz.confidence === 'High' ? '#10b981' : '#06b6d4',
                    fillOpacity: 0.25,
                    weight: 2,
                  }}
                />
              )}

              <Marker
                position={[pfz.latitude, pfz.longitude]}
                icon={pfz.confidence === 'High' ? pfzIconHigh : pfzIconModerate}
                eventHandlers={{
                  click: () => {
                    onSelectPfz?.(pfz);
                  },
                }}
              >
                <Popup>
                  <div className="p-3.5 space-y-2 text-xs font-sans max-w-xs">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="px-1.5 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded font-mono text-[10px] font-bold">
                          {pfz.confidence} CONFIDENCE PFZ
                        </span>
                        <h4 className="font-bold text-white text-sm mt-1">{pfz.name}</h4>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 p-2 bg-marine-950 border border-marine-750 rounded-lg text-slate-300 font-mono text-[11px]">
                      <div>Bearing: <strong className="text-cyan-400">{pfz.bearingDegrees}° {pfz.directionFromLandingCentre}</strong></div>
                      <div>Dist: <strong className="text-white">{pfz.distanceKm} km</strong></div>
                      <div>Depth: <strong className="text-white">{pfz.depth} m</strong></div>
                      <div>SST: <strong className="text-amber-400">{pfz.seaSurfaceTemperature}°C</strong></div>
                    </div>

                    <div className="text-slate-400 text-[11px]">
                      <strong>Target:</strong> {pfz.targetSpecies.join(', ')}
                    </div>

                    <p className="text-[11px] text-slate-400 line-clamp-2">{pfz.description}</p>

                    <div className="flex gap-2 pt-2 border-t border-marine-750">
                      <button
                        type="button"
                        onClick={() => navigate(`/pfz/${pfz.id}`)}
                        className="flex-1 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-black font-bold rounded-lg text-center text-xs"
                      >
                        Full Details
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAskAssistant(pfz)}
                        className="px-2.5 py-1.5 bg-marine-800 hover:bg-marine-700 text-cyan-300 rounded-lg text-xs flex items-center gap-1"
                        title="Ask AI Assistant"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          ))}

        {/* 3. Landing Centres & Fishing Harbours */}
        {layers.showLandingCentres &&
          SEED_LANDING_CENTRES.map((lc) => (
            <Marker
              key={lc.id}
              position={[lc.coordinates.lat, lc.coordinates.lng]}
              icon={harbourIcon}
            >
              <Popup>
                <div className="p-3 text-xs space-y-1.5 font-sans">
                  <div className="flex items-center gap-1.5 text-blue-400 font-bold">
                    <Anchor className="w-4 h-4" />
                    <span>{lc.name}</span>
                  </div>
                  <p className="text-slate-300">{lc.district}, {lc.state}</p>
                  <div className="p-2 bg-marine-950 rounded text-slate-400 text-[11px] space-y-0.5">
                    <div>Harbour Category: <strong className="text-white">{lc.harbourType}</strong></div>
                    <div>Active Fleet: <strong className="text-cyan-400">{lc.activeBoatsCount} vessels</strong></div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* 4. Active SOS Incidents */}
        {layers.showSosIncidents &&
          incidents.map((sos) => (
            <Marker
              key={sos.id}
              position={[sos.coordinates.lat, sos.coordinates.lng]}
              icon={sosIcon}
            >
              <Popup>
                <div className="p-3.5 text-xs space-y-2 font-sans max-w-xs border-t-2 border-red-500">
                  <div className="flex items-center justify-between">
                    <span className="px-1.5 py-0.5 bg-red-950 text-red-300 border border-red-800 rounded font-mono text-[10px] font-bold">
                      🚨 ACTIVE DISTRESS BEACON
                    </span>
                    <span className="text-slate-400 text-[10px] font-mono">{sos.incidentCode}</span>
                  </div>

                  <h4 className="font-bold text-white text-sm">{sos.emergencyType}</h4>
                  <p className="text-slate-300 text-[11px]">{sos.locationDescription}</p>

                  <div className="p-2 bg-red-950/40 border border-red-900 rounded-lg text-slate-300 text-[11px] space-y-1 font-mono">
                    <div>Souls Affected: <strong className="text-red-400">{sos.peopleAffectedCount}</strong></div>
                    <div>Vessel: <strong className="text-white">{sos.vesselRegNumber}</strong></div>
                    <div>Status: <strong className="text-amber-400 uppercase">{sos.status}</strong></div>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate(`/sos/${sos.id}`)}
                    className="w-full py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs"
                  >
                    Open Incident Command
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* 5. Field Extension Agents */}
        {layers.showAgents &&
          agents.map((agent) => (
            <Marker
              key={agent.id}
              position={[agent.coordinates.lat, agent.coordinates.lng]}
              icon={agentIcon}
            >
              <Popup>
                <div className="p-3 text-xs space-y-1.5 font-sans">
                  <div className="flex items-center gap-2">
                    <img
                      src={agent.avatar}
                      alt={agent.name}
                      className="w-7 h-7 rounded-full object-cover border border-cyan-400"
                    />
                    <div>
                      <h4 className="font-bold text-white">{agent.name}</h4>
                      <p className="text-[10px] text-cyan-400 font-mono">{agent.badgeNumber}</p>
                    </div>
                  </div>
                  <div className="text-slate-300 text-[11px]">
                    Status: <span className="capitalize font-bold text-emerald-400">{agent.status}</span> ({agent.currentWorkload}/{agent.maxWorkload} cases)
                  </div>
                  <div className="text-slate-400 text-[10px]">
                    Languages: {agent.languages.map((l) => l.toUpperCase()).join(', ')}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* Measure Tool Polyline */}
        {measureMode && measurePoints.length > 1 && (
          <Polyline
            positions={measurePoints.map((p) => [p.lat, p.lng])}
            pathOptions={{ color: '#00f0ff', weight: 3, dashArray: '6, 6' }}
          />
        )}
      </MapContainer>

      {/* Floating Top Left Telemetry HUD */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
        <div className="p-3 bg-marine-900/90 border border-marine-750 backdrop-blur-md rounded-xl shadow-hud text-xs space-y-1 min-w-[210px]">
          <div className="flex items-center justify-between text-slate-400 font-mono text-[10px]">
            <span>{t('map.cursorTelemetry', 'CURSOR TELEMETRY')}</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              {t('map.live', 'LIVE')}
            </span>
          </div>
          <div className="font-mono text-cyan-300 font-bold text-sm">
            {cursorCoords.lat.toFixed(4)}°N, {cursorCoords.lng.toFixed(4)}°E
          </div>
          <div className="text-[11px] text-slate-400">
            {t('map.activePfzInView', 'Active PFZs in View')}: <strong className="text-white">{displayedAdvisories.length}</strong>
          </div>
        </div>
      </div>

      {/* Floating Top Right Map Controls Toolbar */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        {/* Layer Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsLayerControlOpen(!isLayerControlOpen)}
            className="flex items-center gap-1.5 px-3 py-2 bg-marine-900/90 border border-marine-750 hover:border-cyan-500 rounded-xl text-xs font-semibold text-slate-200 backdrop-blur-md shadow-hud transition"
          >
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>{t('map.gisLayers', 'GIS Layers')}</span>
          </button>

          {isLayerControlOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-marine-900 border border-marine-700 rounded-2xl shadow-2xl p-3 z-50 space-y-2 text-xs animate-in fade-in">
              <div className="font-bold text-slate-300 border-b border-marine-750 pb-1.5 flex items-center justify-between">
                <span>{t('map.overlays', 'Marine GIS Overlays')}</span>
                <button
                  onClick={() => setIsLayerControlOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {/* Base Map Providers */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">{t('map.tileProvider', 'Tile Provider')}</span>
                  <button
                    type="button"
                    onClick={() => setIsApiKeyModalOpen(true)}
                    className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 px-1.5 py-0.5 rounded bg-marine-950 border border-marine-750 hover:border-cyan-500 transition"
                    title="Configure CARTO API Key"
                  >
                    <Key className="w-2.5 h-2.5" />
                    <span>{cartoApiKey ? 'Key Active' : 'API Key'}</span>
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  <button
                    type="button"
                    onClick={() => setTileProvider('esri_dark')}
                    className={`p-1.5 rounded text-[10px] font-mono transition ${
                      activeTileProvider === 'esri_dark' ? 'bg-cyan-600 text-black font-bold' : 'bg-marine-800 text-slate-300 hover:bg-marine-750'
                    }`}
                    title="Clean Dark Canvas (Zero Watermarks, No Key Needed)"
                  >
                    Dark
                  </button>
                  <button
                    type="button"
                    onClick={() => setTileProvider('carto_dark')}
                    className={`p-1.5 rounded text-[10px] font-mono transition ${
                      activeTileProvider === 'carto_dark' ? 'bg-cyan-600 text-black font-bold' : 'bg-marine-800 text-slate-300 hover:bg-marine-750'
                    }`}
                    title="CARTO Dark Matter (Requires Free API Key)"
                  >
                    CARTO
                  </button>
                  <button
                    type="button"
                    onClick={() => setTileProvider('osm_standard')}
                    className={`p-1.5 rounded text-[10px] font-mono transition ${
                      activeTileProvider === 'osm_standard' ? 'bg-cyan-600 text-black font-bold' : 'bg-marine-800 text-slate-300 hover:bg-marine-750'
                    }`}
                  >
                    OSM
                  </button>
                  <button
                    type="button"
                    onClick={() => setTileProvider('esri_satellite')}
                    className={`p-1.5 rounded text-[10px] font-mono transition ${
                      activeTileProvider === 'esri_satellite' ? 'bg-cyan-600 text-black font-bold' : 'bg-marine-800 text-slate-300 hover:bg-marine-750'
                    }`}
                  >
                    Sat
                  </button>
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-1.5 pt-1 border-t border-marine-750">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="flex items-center gap-1.5 text-emerald-300">
                    <Fish className="w-3.5 h-3.5" /> {t('map.pfzAdvisories', 'PFZ Advisories')}
                  </span>
                  <input
                    type="checkbox"
                    checked={layers.showPfzPolygons}
                    onChange={() => toggleLayer('showPfzPolygons')}
                    className="accent-emerald-500 rounded"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="flex items-center gap-1.5 text-blue-300">
                    <Anchor className="w-3.5 h-3.5" /> {t('map.landingCentres', 'Landing Centres')}
                  </span>
                  <input
                    type="checkbox"
                    checked={layers.showLandingCentres}
                    onChange={() => toggleLayer('showLandingCentres')}
                    className="accent-blue-500 rounded"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="flex items-center gap-1.5 text-red-400">
                    <AlertOctagon className="w-3.5 h-3.5" /> {t('map.sosEmergencies', 'SOS Distress Beacons')}
                  </span>
                  <input
                    type="checkbox"
                    checked={layers.showSosIncidents}
                    onChange={() => toggleLayer('showSosIncidents')}
                    className="accent-red-500 rounded"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="flex items-center gap-1.5 text-cyan-300">
                    <User className="w-3.5 h-3.5" /> {t('map.fieldAgents', 'Field Agents')}
                  </span>
                  <input
                    type="checkbox"
                    checked={layers.showAgents}
                    onChange={() => toggleLayer('showAgents')}
                    className="accent-cyan-500 rounded"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="flex items-center gap-1.5 text-purple-300">
                    <Shield className="w-3.5 h-3.5" /> {t('nav.zones', 'Operational Zones')}
                  </span>
                  <input
                    type="checkbox"
                    checked={layers.showZones}
                    onChange={() => toggleLayer('showZones')}
                    className="accent-purple-500 rounded"
                  />
                </label>

                <div className="h-px bg-marine-750 my-1" />

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="flex items-center gap-1.5 text-blue-400">
                    <Layers className="w-3.5 h-3.5" /> Live Weather (Wind)
                  </span>
                  <input
                    type="checkbox"
                    checked={layers.showWeather}
                    onChange={() => toggleLayer('showWeather')}
                    className="accent-blue-400 rounded"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="flex items-center gap-1.5 text-orange-500">
                    <AlertTriangle className="w-3.5 h-3.5" /> NASA Thermal Anomalies
                  </span>
                  <input
                    type="checkbox"
                    checked={layers.showNasaFirms}
                    onChange={() => toggleLayer('showNasaFirms')}
                    className="accent-orange-500 rounded"
                  />
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Distance Measure Tool */}
        <button
          onClick={() => {
            setMeasureMode(!measureMode);
            if (measureMode) setMeasurePoints([]);
          }}
          className={`flex items-center gap-1.5 px-3 py-2 border rounded-xl text-xs font-semibold backdrop-blur-md shadow-hud transition ${
            measureMode ? 'bg-cyan-500 text-black border-cyan-400' : 'bg-marine-900/90 text-slate-200 border-marine-750'
          }`}
          title="Measure Nautical Distance"
        >
          <Ruler className="w-4 h-4" />
          <span>{measureMode ? 'Measuring...' : t('map.measureDistance', 'Measure')}</span>
        </button>
      </div>

      {/* Floating Warning Banner when CARTO Dark is selected without an API Key */}
      {activeTileProvider === 'carto_dark' && !cartoApiKey && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-2.5 bg-marine-950/95 border border-amber-500/70 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-2xl text-xs animate-in fade-in">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-amber-200 font-medium">CARTO requires an API key to remove watermark</span>
          <button
            type="button"
            onClick={() => setIsApiKeyModalOpen(true)}
            className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-black font-extrabold rounded-lg text-[11px] shadow-glow-cyan transition flex items-center gap-1"
          >
            <Key className="w-3 h-3" />
            <span>Configure Key</span>
          </button>
          <button
            type="button"
            onClick={() => setTileProvider('esri_dark')}
            className="px-2.5 py-1 bg-marine-800 hover:bg-marine-700 text-slate-200 border border-marine-700 rounded-lg text-[11px] transition"
          >
            Use Clean Dark (Esri)
          </button>
        </div>
      )}

      {/* Floating Bottom Center Map Legend */}
      <div className="absolute bottom-4 left-4 z-20 hidden md:flex items-center gap-4 px-3.5 py-2 bg-marine-900/90 border border-marine-750 backdrop-blur-md rounded-xl shadow-hud text-[11px]">
        <div className="flex items-center gap-1.5 text-emerald-400">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>High PFZ</span>
        </div>
        <div className="flex items-center gap-1.5 text-cyan-400">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
          <span>Moderate PFZ</span>
        </div>
        <div className="flex items-center gap-1.5 text-blue-400">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          <span>Harbour</span>
        </div>
        <div className="flex items-center gap-1.5 text-red-400">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
          <span>SOS Distress</span>
        </div>
      </div>

      {/* CARTO API Key Setup Modal */}
      <CartoApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
      />
    </div>
  );
};
