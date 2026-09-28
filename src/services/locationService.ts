import { PfzAdvisory } from '../types';
import { usePfzStore } from '../store/pfzStore';
import { useMapStore } from '../store/mapStore';

export interface ResolvedLocation {
  lat: number;
  lng: number;
  name: string;
  source: 'query_text' | 'selected_landing_centre' | 'map_selection' | 'gps' | 'user_profile' | 'fallback';
  matchedAdvisory?: PfzAdvisory;
  isExplicitMatch: boolean;
}

export const KNOWN_COASTAL_LOCATIONS: { keywords: string[]; name: string; lat: number; lng: number; district?: string; state?: string }[] = [
  { keywords: ['kasimedu', 'chennai', 'ennore', 'pulicat'], name: 'Kasimedu / Chennai Coast', lat: 13.125, lng: 80.298, district: 'Chennai', state: 'Tamil Nadu' },
  { keywords: ['tuticorin', 'thoothukudi', 'mannar', 'gulf of mannar'], name: 'Tuticorin (Thoothukudi)', lat: 8.764, lng: 78.157, district: 'Thoothukudi', state: 'Tamil Nadu' },
  { keywords: ['vizag', 'visakhapatnam', 'gangavaram', 'bhimunipatnam', 'andhra'], name: 'Visakhapatnam (Vizag)', lat: 17.686, lng: 83.218, district: 'Visakhapatnam', state: 'Andhra Pradesh' },
  { keywords: ['cochin', 'kochi', 'vypeen', 'ernakulam', 'kerala'], name: 'Cochin (Kochi)', lat: 9.931, lng: 76.267, district: 'Ernakulam', state: 'Kerala' },
  { keywords: ['mumbai', 'sasoon', 'trombay', 'alibag', 'maharashtra'], name: 'Mumbai Coast', lat: 18.940, lng: 72.835, district: 'Mumbai', state: 'Maharashtra' },
  { keywords: ['goa', 'panaji', 'mormugao', 'vasco'], name: 'Goa Coast', lat: 15.498, lng: 73.827, district: 'South Goa', state: 'Goa' },
  { keywords: ['mangalore', 'mangaluru', 'malpe', 'karnataka'], name: 'Mangalore Port', lat: 12.868, lng: 74.842, district: 'Dakshina Kannada', state: 'Karnataka' },
  { keywords: ['rameswaram', 'pamban', 'mandapam'], name: 'Rameswaram Coast', lat: 9.287, lng: 79.312, district: 'Ramanathapuram', state: 'Tamil Nadu' },
  { keywords: ['kanyakumari', 'colachel', 'cape comorin'], name: 'Kanyakumari', lat: 8.088, lng: 77.538, district: 'Kanyakumari', state: 'Tamil Nadu' },
  { keywords: ['puducherry', 'pondicherry', 'karaikal'], name: 'Puducherry Coast', lat: 11.941, lng: 79.808, district: 'Puducherry', state: 'Puducherry' },
  { keywords: ['nagapattinam', 'vedaranyam'], name: 'Nagapattinam', lat: 10.767, lng: 79.843, district: 'Nagapattinam', state: 'Tamil Nadu' },
  { keywords: ['cuddalore'], name: 'Cuddalore Port', lat: 11.748, lng: 79.771, district: 'Cuddalore', state: 'Tamil Nadu' },
  { keywords: ['machilipatnam', 'masulipatnam'], name: 'Machilipatnam', lat: 16.181, lng: 81.136, district: 'Krishna', state: 'Andhra Pradesh' },
  { keywords: ['kakinada'], name: 'Kakinada Anchorage', lat: 16.989, lng: 82.247, district: 'East Godavari', state: 'Andhra Pradesh' },
  { keywords: ['paradeep', 'paradip', 'odisha'], name: 'Paradeep Coast', lat: 20.316, lng: 86.611, district: 'Jagatsinghpur', state: 'Odisha' },
  { keywords: ['veraval', 'gujarat'], name: 'Veraval Coast', lat: 20.900, lng: 70.366, district: 'Gir Somnath', state: 'Gujarat' },
  { keywords: ['porbandar'], name: 'Porbandar Port', lat: 21.642, lng: 69.609, district: 'Porbandar', state: 'Gujarat' },
];

export class LocationService {
  /**
   * Resolve location according to specified priority:
   * 1. Explicit location requested in query text or active advisory match
   * 2. Explicitly selected landing centre filter in store (if not 'ALL')
   * 3. Currently selected map point / advisory on MarineMap
   * 4. Browser GPS coordinates if available
   * 5. Valid application fallback (clearly tagged as fallback)
   */
  public static resolveLocation(
    queryText?: string,
    advisories?: PfzAdvisory[]
  ): ResolvedLocation {
    const activeAdvisories = advisories || usePfzStore.getState().advisories;

    // ── PRIORITY 1: Explicit Location in Query Text ──────────────────────────
    if (queryText && queryText.trim().length > 0) {
      const q = queryText.toLowerCase();

      // Check matching PFZ advisory by landing centre name, district, state, or name
      if (activeAdvisories && activeAdvisories.length > 0) {
        const matchedAdv = activeAdvisories.find(
          (a) =>
            q.includes(a.landingCentreName.toLowerCase()) ||
            q.includes(a.district.toLowerCase()) ||
            q.includes(a.state.toLowerCase()) ||
            q.includes(a.name.toLowerCase())
        );

        if (matchedAdv) {
          return {
            lat: matchedAdv.latitude,
            lng: matchedAdv.longitude,
            name: `${matchedAdv.landingCentreName} Coast`,
            source: 'query_text',
            matchedAdvisory: matchedAdv,
            isExplicitMatch: true,
          };
        }
      }

      // Check known coastal location dictionary
      const matchedKnown = KNOWN_COASTAL_LOCATIONS.find((loc) =>
        loc.keywords.some((k) => q.includes(k))
      );

      if (matchedKnown) {
        const adv = activeAdvisories?.find(
          (a) =>
            a.landingCentreName.toLowerCase().includes(matchedKnown.keywords[0]) ||
            a.district.toLowerCase().includes(matchedKnown.keywords[0])
        );

        return {
          lat: matchedKnown.lat,
          lng: matchedKnown.lng,
          name: matchedKnown.name,
          source: 'query_text',
          matchedAdvisory: adv,
          isExplicitMatch: true,
        };
      }
    }

    // ── PRIORITY 2: Explicitly Selected Landing Centre ───────────────────────
    const selectedLandingCentre = usePfzStore.getState().selectedLandingCentre;
    if (selectedLandingCentre && selectedLandingCentre !== 'ALL') {
      const adv = activeAdvisories.find((a) => a.landingCentreName === selectedLandingCentre);
      if (adv) {
        return {
          lat: adv.latitude,
          lng: adv.longitude,
          name: `${adv.landingCentreName} Coast`,
          source: 'selected_landing_centre',
          matchedAdvisory: adv,
          isExplicitMatch: true,
        };
      }
    }

    // ── PRIORITY 3: Selected Map Point or Advisory ──────────────────────────
    const mapState = useMapStore.getState();
    if (mapState.selectedFeature?.data?.latitude && mapState.selectedFeature?.data?.longitude) {
      const featData = mapState.selectedFeature.data;
      return {
        lat: featData.latitude,
        lng: featData.longitude,
        name: featData.name || featData.landingCentreName || `Map Location [${featData.latitude.toFixed(3)}, ${featData.longitude.toFixed(3)}]`,
        source: 'map_selection',
        matchedAdvisory: mapState.selectedFeature.type === 'pfz' ? featData : undefined,
        isExplicitMatch: true,
      };
    }
    if (mapState.userGpsPosition) {
      return {
        lat: mapState.userGpsPosition.lat,
        lng: mapState.userGpsPosition.lng,
        name: 'Vessel GPS Position',
        source: 'gps',
        isExplicitMatch: true,
      };
    }

    const selectedAdvisory = usePfzStore.getState().selectedAdvisory;
    if (selectedAdvisory) {
      return {
        lat: selectedAdvisory.latitude,
        lng: selectedAdvisory.longitude,
        name: `${selectedAdvisory.landingCentreName} Coast`,
        source: 'map_selection',
        matchedAdvisory: selectedAdvisory,
        isExplicitMatch: true,
      };
    }

    // ── PRIORITY 4: Browser GPS Coordinates (if available) ───────────────────
    if (typeof window !== 'undefined' && (window as any).__orca_user_gps) {
      const gps = (window as any).__orca_user_gps;
      return {
        lat: gps.lat,
        lng: gps.lng,
        name: gps.name || 'Current Vessel Position (GPS)',
        source: 'gps',
        isExplicitMatch: true,
      };
    }

    // ── PRIORITY 5: Application Fallback ────────────────────────────────────
    const defaultAdv = activeAdvisories && activeAdvisories.length > 0 ? activeAdvisories[0] : null;

    return {
      lat: defaultAdv?.latitude || 13.125,
      lng: defaultAdv?.longitude || 80.298,
      name: defaultAdv ? `${defaultAdv.landingCentreName} Coast` : 'Kasimedu / Chennai Coast',
      source: 'fallback',
      matchedAdvisory: defaultAdv || undefined,
      isExplicitMatch: false,
    };
  }
}
