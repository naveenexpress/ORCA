import { describe, it, expect, beforeEach } from 'vitest';
import { useMapStore } from '../store/mapStore';

describe('MapStore & CARTO API Key Workflow', () => {
  beforeEach(() => {
    localStorage.clear();
    useMapStore.setState({
      cartoApiKey: '',
      activeTileProvider: 'esri_dark',
    });
  });

  it('initializes with default clean dark provider when no key is set', () => {
    const state = useMapStore.getState();
    expect(state.activeTileProvider).toBe('esri_dark');
    expect(state.cartoApiKey).toBe('');
  });

  it('updates and persists cartoApiKey in localStorage and state', () => {
    const testKey = 'test_carto_token_12345';
    useMapStore.getState().setCartoApiKey(testKey);

    expect(useMapStore.getState().cartoApiKey).toBe(testKey);
    expect(localStorage.getItem('orca_carto_api_key')).toBe(testKey);
  });

  it('allows switching between all supported tile providers', () => {
    const store = useMapStore.getState();

    store.setTileProvider('carto_dark');
    expect(useMapStore.getState().activeTileProvider).toBe('carto_dark');

    store.setTileProvider('osm_standard');
    expect(useMapStore.getState().activeTileProvider).toBe('osm_standard');

    store.setTileProvider('esri_satellite');
    expect(useMapStore.getState().activeTileProvider).toBe('esri_satellite');

    store.setTileProvider('esri_dark');
    expect(useMapStore.getState().activeTileProvider).toBe('esri_dark');
  });

  it('clearing the key updates state and localStorage correctly', () => {
    useMapStore.getState().setCartoApiKey('temporary_key');
    expect(useMapStore.getState().cartoApiKey).toBe('temporary_key');

    useMapStore.getState().setCartoApiKey('');
    expect(useMapStore.getState().cartoApiKey).toBe('');
    expect(localStorage.getItem('orca_carto_api_key')).toBe('');
  });
});
