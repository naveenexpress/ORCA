import { LanguageCode, PfzAdvisory } from '../../types';

export type MarineIntent = 
  | 'emergency_sos'
  | 'weather_sea_state'
  | 'pfz_fishing_zone'
  | 'navigation_harbour'
  | 'oceanographic_science'
  | 'service_harbour_case'
  | 'general_guidance';

export interface LiveWeatherData {
  temp: number;
  feelsLike: number;
  humidity: number;
  pressure: number;
  windSpeedKnots: number;
  windSpeedKmh: number;
  windDeg: number;
  windCardinal: string;
  visibilityKm: number;
  visibilityNm: number;
  description: string;
  icon: string;
  waveEstimate: string;
  seaStatus: 'SAFE TO VENTURE' | 'CAUTION ADVISED' | 'ROUGH SEA';
  seaStatusColor: string;
  city: string;
  lastUpdated: string;
  isLiveData: boolean;
}

export interface AgentQueryResult {
  text: string;
  isVerifiedData: boolean;
  sourceCitation: string;
  dataTimestamp?: string;
  intent: MarineIntent;
  quickActions?: { label: string; action: string; payload?: any }[];
  cardPreview?: {
    type: 'pfz' | 'case' | 'sos' | 'weather' | 'agent';
    data: any;
  };
}
