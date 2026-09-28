import { create } from 'zustand';
import { Coordinates } from '../types';

export interface MapLayerConfig {
  showPfzPolygons: boolean;
  showLandingCentres: boolean;
  showAgents: boolean;
  showZones: boolean;
  showSosIncidents: boolean;
  showSstHeatmap: boolean;
  showChlorophyll: boolean;
  showBathymetry: boolean;
  showWeather: boolean;
  showNasaFirms: boolean;
}

export type TileProvider = 'carto_dark' | 'esri_dark' | 'osm_standard' | 'esri_satellite' | 'mapbox_dark' | 'mapbox_satellite';

interface MapState {
  center: Coordinates;
  zoom: number;
  layers: MapLayerConfig;
  activeTileProvider: TileProvider;
  cartoApiKey: string;
  selectedFeature: {
    type: 'pfz' | 'agent' | 'zone' | 'sos' | 'landing_centre';
    id: string;
    data: any;
  } | null;
  isMeasuring: boolean;
  measurePoints: Coordinates[];
  navigationTarget: any | null;
  isNavigating: boolean;
  userGpsPosition: Coordinates | null;
  
  setCenter: (coords: Coordinates) => void;
  setZoom: (zoom: number) => void;
  toggleLayer: (layer: keyof MapLayerConfig) => void;
  setTileProvider: (provider: TileProvider) => void;
  setCartoApiKey: (key: string) => void;
  setSelectedFeature: (feature: MapState['selectedFeature']) => void;
  toggleMeasuring: () => void;
  addMeasurePoint: (coord: Coordinates) => void;
  clearMeasurePoints: () => void;
  resetView: () => void;
  setUserGpsPosition: (pos: Coordinates | null) => void;
  startNavigation: (target: any) => void;
  stopNavigation: () => void;
}

const DEFAULT_CENTER: Coordinates = { lat: 13.5, lng: 80.8 }; // Bay of Bengal Coromandel Coast
const DEFAULT_ZOOM = 7;

const getInitialCartoKey = (): string => {
  const envKey = import.meta.env.VITE_CARTO_API_KEY || '';
  if (envKey) return envKey;
  
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('orca_carto_api_key');
    if (saved) return saved;
  }
  return '';
};

const initialCartoKey = getInitialCartoKey();

export const useMapStore = create<MapState>((set) => ({
  center: DEFAULT_CENTER,
  zoom: DEFAULT_ZOOM,
  layers: {
    showPfzPolygons: true,
    showLandingCentres: true,
    showAgents: true,
    showZones: true,
    showSosIncidents: true,
    showSstHeatmap: false,
    showChlorophyll: false,
    showBathymetry: false,
    showWeather: false,
    showNasaFirms: false,
  },
  activeTileProvider: initialCartoKey ? 'carto_dark' : 'esri_dark',
  cartoApiKey: initialCartoKey,
  selectedFeature: null,
  isMeasuring: false,
  measurePoints: [],
  navigationTarget: null,
  isNavigating: false,
  userGpsPosition: null,

  setCenter: (center) => set({ center }),
  setZoom: (zoom) => set({ zoom }),
  toggleLayer: (layer) =>
    set((state) => ({
      layers: {
        ...state.layers,
        [layer]: !state.layers[layer],
      },
    })),
  setTileProvider: (activeTileProvider) => set({ activeTileProvider }),
  setCartoApiKey: (cartoApiKey) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('orca_carto_api_key', cartoApiKey);
    }
    set({ cartoApiKey });
  },
  setSelectedFeature: (selectedFeature) => set({ selectedFeature }),
  toggleMeasuring: () =>
    set((state) => ({
      isMeasuring: !state.isMeasuring,
      measurePoints: state.isMeasuring ? [] : state.measurePoints,
    })),
  addMeasurePoint: (coord) =>
    set((state) => ({
      measurePoints: [...state.measurePoints, coord],
    })),
  clearMeasurePoints: () => set({ measurePoints: [], isMeasuring: false }),
  resetView: () => set({ center: DEFAULT_CENTER, zoom: DEFAULT_ZOOM }),
  setUserGpsPosition: (userGpsPosition) => set({ userGpsPosition }),
  startNavigation: (navigationTarget) => set({ navigationTarget, isNavigating: true }),
  stopNavigation: () => set({ navigationTarget: null, isNavigating: false }),
}));
