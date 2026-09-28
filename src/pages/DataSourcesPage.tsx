import React from 'react';
import { Database, ExternalLink } from 'lucide-react';

const DATA_FEEDS = [
  {
    name: 'INCOIS Potential Fishing Zone (PFZ) Advisory Web GIS',
    agency: 'Indian National Centre for Ocean Information Services (Ministry of Earth Sciences)',
    type: 'Satellite Radiometry & Ocean Color (Oceansat-3 / MODIS / VIIRS)',
    url: 'https://incois.gov.in/MarineFisheries/PfzAdvisory',
    status: 'ACTIVE_FEED',
    frequency: 'Daily (04:00 & 16:00 IST)',
  },
  {
    name: 'India Meteorological Department (IMD) Marine Weather Bulletin',
    agency: 'India Meteorological Department (IMD)',
    type: 'Coastal Squall Warning, Doppler Radar, 5-Day Sea State',
    url: 'https://mausam.imd.gov.in',
    status: 'ACTIVE_FEED',
    frequency: 'Every 6 Hours',
  },
  {
    name: 'Indian Coast Guard MRCC SAR Dispatch Bridge',
    agency: 'Indian Coast Guard (Ministry of Defence)',
    type: 'Maritime SAR Protocol, AIS Vessel Tracking, Channel 16 VHF',
    url: 'https://indiancoastguard.gov.in',
    status: 'ACTIVE_FEED',
    frequency: 'Real-time Event Stream',
  },
  {
    name: 'National Institute of Ocean Technology (NIOT) Deep Sea Buoy Network',
    agency: 'National Institute of Ocean Technology',
    type: 'Moored Buoy Data, Subsurface Salinity & Temperature Gradients',
    url: 'https://www.niot.res.in',
    status: 'CONNECTED',
    frequency: 'Hourly Telemetry',
  },
];

export const DataSourcesPage: React.FC = () => {
  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-marine-900 via-marine-850 to-cyan-950/40 p-5 rounded-2xl border border-marine-750 shadow-hud">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-800 rounded font-mono text-xs font-bold flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              SATELLITE & OCEAN DATA SOURCES
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Remote Sensing & Ingestion Feeds
          </h1>
          <p className="text-xs text-slate-300">
            Official government open-access marine feeds integrated into the ORCA platform.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {DATA_FEEDS.map((feed, idx) => (
          <div key={idx} className="marine-card rounded-2xl p-5 border border-marine-750 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-marine-800 pb-3">
              <div>
                <h3 className="font-bold text-white text-sm">{feed.name}</h3>
                <p className="text-xs text-cyan-300 font-mono">{feed.agency}</p>
              </div>
              <span className="px-2.5 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded font-mono text-xs font-bold self-start sm:self-auto">
                {feed.status}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono text-slate-300">
              <div>Telemetry Type: <strong className="text-white">{feed.type}</strong></div>
              <div>Ingest Interval: <strong className="text-cyan-400">{feed.frequency}</strong></div>
            </div>

            <div className="pt-2 border-t border-marine-800 flex justify-end">
              <a
                href={feed.url}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-cyan-400 hover:underline flex items-center gap-1.5"
              >
                <span>Visit Official Agency Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
